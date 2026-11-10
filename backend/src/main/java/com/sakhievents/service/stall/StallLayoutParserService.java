package com.sakhievents.service.stall;

import com.sakhievents.dto.stall.StallConfiguration;
import org.opencv.core.Core;
import org.opencv.core.Mat;
import org.opencv.core.MatOfPoint;
import org.opencv.core.Rect;
import org.opencv.core.Scalar;
import org.opencv.core.Size;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

/**
 * Computer vision pipeline for extracting structural bounding configurations of event stalls
 * from color-coded floor plan layout images using OpenCV HSV segmentation, structural edge subtraction,
 * vertical fragment stitching, and multi-stall text-column splitting.
 */
@Service
public class StallLayoutParserService {

    private static final Logger log = LoggerFactory.getLogger(StallLayoutParserService.class);

    // Minimum geometric surface area in square pixels to filter out noise, borders, or pixel dust
    private static final double MIN_CONTOUR_AREA = 400.0;

    // Load native OpenCV libraries once at class initialization
    static {
        try {
            nu.pattern.OpenCV.loadLocally();
            log.info("OpenCV native library loaded successfully via loadLocally(). Version: {}", Core.VERSION);
        } catch (Throwable fallback) {
            try {
                nu.pattern.OpenCV.loadShared();
                log.info("OpenCV native library loaded successfully via loadShared(). Version: {}", Core.VERSION);
            } catch (Throwable t) {
                log.error("Failed to load OpenCV native shared libraries", t);
                throw new ExceptionInInitializerError(t);
            }
        }
    }

    /**
     * Definition of an HSV boundary range for a specific stall tier.
     * OpenCV 8-bit HSV ranges:
     *   - Hue (H):        0 - 179 (representing 0 to 360 degrees halved)
     *   - Saturation (S): 0 - 255 (0% to 100%)
     *   - Value (V):      0 - 255 (0% to 100% brightness)
     */
    public record HsvColorRule(String category, Scalar lowerBound, Scalar upperBound) {}

    // Color definitions for the 4 explicit layout tiers, calibrated for both bright and dark tones
    private static final List<HsvColorRule> COLOR_RULES = List.of(
            // PREMIUM: Orange and Amber/Golden tones (H: 5..24 covers dark brown, bright orange #E67E22, and amber stalls 38, 39)
            new HsvColorRule(
                    "PREMIUM",
                    new Scalar(5, 50, 40),
                    new Scalar(24, 255, 255)
            ),
            // REGULAR: Pure Yellow tones (H: 25..35 covers warm golden yellow, ORG, and yellow stalls)
            new HsvColorRule(
                    "REGULAR",
                    new Scalar(25, 50, 100),
                    new Scalar(35, 255, 255)
            ),
            // CLASSIC: Green tones (standard mid-to-bright green)
            new HsvColorRule(
                    "CLASSIC",
                    new Scalar(36, 40, 50),
                    new Scalar(85, 255, 255)
            ),
            // SINGLE_TABLE: Blue tones (light sky blue to deep royal blue)
            new HsvColorRule(
                    "SINGLE_TABLE",
                    new Scalar(90, 40, 50),
                    new Scalar(135, 255, 255)
            )
    );

    /**
     * Parses an uploaded image containing color-coded rectangular stalls.
     * Isolates stalls via HSV color-thresholding segmentation, isolates sub-blocks along internal
     * grid divider lines via edge subtraction, stitches vertical stall fragments (e.g. Stall 12),
     * splits connected multi-stall units (e.g. Stalls 38 and 39), and normalizes coordinates to relative percentages.
     *
     * @param imagePath absolute or relative file path to the layout image
     * @return unmodifiable list of detected and normalized stall configurations
     * @throws IllegalArgumentException if the image path is invalid or the image cannot be read/decoded
     */
    public List<StallConfiguration> processLayoutImage(String imagePath) {
        if (imagePath == null || imagePath.isBlank()) {
            throw new IllegalArgumentException("Image path must not be null or blank");
        }

        File file = new File(imagePath);
        if (!file.exists() || !file.isFile()) {
            throw new IllegalArgumentException("Layout image does not exist at path: " + imagePath);
        }

        Mat src = null;
        Mat hsv = null;
        Mat gray = null;
        Mat edges = null;
        Mat dilatedEdges = null;
        Mat edgeKernel = null;

        try {
            // 1. Image Matrix Setup: Load image via Imgcodecs.imread()
            src = Imgcodecs.imread(imagePath);
            if (src.empty()) {
                throw new IllegalArgumentException("OpenCV failed to decode image matrix (empty or corrupted): " + imagePath);
            }

            final int originalWidth = src.cols();
            final int originalHeight = src.rows();

            if (originalWidth <= 0 || originalHeight <= 0) {
                throw new IllegalStateException("Invalid image pixel dimensions: " + originalWidth + "x" + originalHeight);
            }

            log.debug("Processing layout image [{}x{}] from {}", originalWidth, originalHeight, imagePath);

            // Convert image from BGR to HSV color space
            hsv = new Mat();
            Imgproc.cvtColor(src, hsv, Imgproc.COLOR_BGR2HSV);

            // Grayscale image for edge detection and text column verification
            gray = new Mat();
            Imgproc.cvtColor(src, gray, Imgproc.COLOR_BGR2GRAY);

            // Extract structural grid divider lines via Canny edge detection on grayscale
            edges = new Mat();
            Imgproc.Canny(gray, edges, 50, 150);

            // Dilate structural edges slightly so divider lines cleanly separate adjacent touching stalls
            dilatedEdges = new Mat();
            edgeKernel = Imgproc.getStructuringElement(Imgproc.MORPH_RECT, new Size(3, 3));
            Imgproc.dilate(edges, dilatedEdges, edgeKernel);

            List<StallConfiguration> results = new ArrayList<>();

            // 2. Color Segmentation & Sub-Block Extraction Loop
            for (HsvColorRule rule : COLOR_RULES) {
                List<StallConfiguration> detectedForTier = extractStallsForCategory(
                        hsv,
                        gray,
                        dilatedEdges,
                        rule,
                        originalWidth,
                        originalHeight
                );
                results.addAll(detectedForTier);
            }

            log.info("Successfully parsed {} stall configurations from {}", results.size(), imagePath);
            return Collections.unmodifiableList(results);

        } finally {
            // 5. Memory Safety: Explicitly release native Mats to prevent off-heap C++ memory leaks
            if (edgeKernel != null) edgeKernel.release();
            if (dilatedEdges != null) dilatedEdges.release();
            if (edges != null) edges.release();
            if (gray != null) gray.release();
            if (hsv != null) hsv.release();
            if (src != null) src.release();
        }
    }

    /**
     * Isolates pixels matching a specific category's HSV rule, subtracts internal structural divider lines
     * to split connected multi-stall blocks into individual sub-stalls, performs contour tracing,
     * stitches sliced vertical header fragments, splits double-width units with multiple text columns,
     * and maps bounds to screen percentages.
     */
    private List<StallConfiguration> extractStallsForCategory(
            Mat hsv,
            Mat gray,
            Mat dilatedEdges,
            HsvColorRule rule,
            int originalWidth,
            int originalHeight
    ) {
        Mat mask = new Mat();
        Mat separated = new Mat();
        Mat cleaned = new Mat();
        Mat closeKernel = null;
        Mat hierarchy = new Mat();
        List<MatOfPoint> contours = new ArrayList<>();
        List<StallConfiguration> configurations = new ArrayList<>();

        try {
            // Step 3a: Create binary mask utilizing Core.inRange()
            Core.inRange(hsv, rule.lowerBound(), rule.upperBound(), mask);

            // Step 3b: Disconnect adjacent touching stalls by subtracting structural divider edges
            separated = new Mat();
            Core.subtract(mask, dilatedEdges, separated);

            // Step 3c: Morphological closing to bridge tiny internal gaps caused by stall number text/labels
            cleaned = new Mat();
            closeKernel = Imgproc.getStructuringElement(Imgproc.MORPH_RECT, new Size(3, 3));
            Imgproc.morphologyEx(separated, cleaned, Imgproc.MORPH_CLOSE, closeKernel);

            // Step 3d: Trace external boundaries of the separated stall cells
            Imgproc.findContours(
                    cleaned,
                    contours,
                    hierarchy,
                    Imgproc.RETR_EXTERNAL,
                    Imgproc.CHAIN_APPROX_SIMPLE
            );

            // Step 3e: Initial candidate extraction and noise filtering
            List<Rect> rawRects = new ArrayList<>();
            for (MatOfPoint contour : contours) {
                double area = Imgproc.contourArea(contour);

                // Filter out structural background artifacts or pixel dust below 400 pixels
                if (area < MIN_CONTOUR_AREA) {
                    continue;
                }

                Rect rect = Imgproc.boundingRect(contour);
                double yPercent = ((double) rect.y / originalHeight) * 100.0;
                double heightPercent = ((double) rect.height / originalHeight) * 100.0;
                double widthPercent = ((double) rect.width / originalWidth) * 100.0;
                double aspectRatio = widthPercent / heightPercent;

                // Discard bottom legend swatches (typically at y > 80%, height < 2.5%, or very wide ratio)
                if (yPercent > 80.0 && (heightPercent < 2.5 || aspectRatio > 4.5)) {
                    continue;
                }

                // General filter for thin borders, noise slivers, or non-rectangular artifacts
                if (heightPercent < 2.0 || aspectRatio > 5.0 || aspectRatio < 0.15) {
                    continue;
                }

                rawRects.add(rect);
            }

            // Step 3f: Vertical Fragment Stitching
            // Reconnects stalls whose top/bottom label headers were segmented by internal CAD lines (e.g. Stall 12)
            rawRects.sort(Comparator.comparingInt((Rect r) -> r.y));
            List<Rect> stitchedRects = new ArrayList<>();
            boolean[] merged = new boolean[rawRects.size()];

            for (int i = 0; i < rawRects.size(); i++) {
                if (merged[i]) continue;
                Rect r1 = rawRects.get(i);
                Rect current = new Rect(r1.x, r1.y, r1.width, r1.height);

                for (int j = i + 1; j < rawRects.size(); j++) {
                    if (merged[j]) continue;
                    Rect r2 = rawRects.get(j);

                    // Check column alignment (similar X position and similar width)
                    boolean xAligned = Math.abs(current.x - r2.x) <= 6 && Math.abs(current.width - r2.width) <= 6;
                    int currentBottom = current.y + current.height;
                    // Check vertical adjacency (boxes are touching or separated by at most divider border)
                    boolean touchingVertically = Math.abs(r2.y - currentBottom) <= 8;

                    // Only merge if at least one piece is a small fragment (< 5.0% height), avoiding merging distinct stalls
                    double h1Percent = ((double) current.height / originalHeight) * 100.0;
                    double h2Percent = ((double) r2.height / originalHeight) * 100.0;
                    boolean isSubFragment = h1Percent < 5.0 || h2Percent < 5.0;

                    if (xAligned && touchingVertically && isSubFragment) {
                        int newY = Math.min(current.y, r2.y);
                        int newBottom = Math.max(currentBottom, r2.y + r2.height);
                        int newX = Math.min(current.x, r2.x);
                        int newW = Math.max(current.width, r2.width);
                        current = new Rect(newX, newY, newW, newBottom - newY);
                        merged[j] = true;
                    }
                }
                stitchedRects.add(current);
            }

            // Step 3g: Multi-Stall Splitting for Connected Blocks without Divider Strokes
            // Identifies double-width stall units (e.g. Stalls 38 and 39) with multiple text columns and splits them
            List<Rect> finalRects = new ArrayList<>();
            for (Rect r : stitchedRects) {
                double widthPercent = ((double) r.width / originalWidth) * 100.0;
                if (widthPercent >= 15.0 && hasMultipleTextColumns(gray, r)) {
                    // Split horizontally into two equal stall units
                    int halfW = r.width / 2;
                    finalRects.add(new Rect(r.x, r.y, halfW, r.height));
                    finalRects.add(new Rect(r.x + halfW, r.y, r.width - halfW, r.height));
                } else {
                    finalRects.add(r);
                }
            }

            // Step 4: Mathematical Coordinate Normalization
            for (Rect rect : finalRects) {
                double xPercent = ((double) rect.x / originalWidth) * 100.0;
                double yPercent = ((double) rect.y / originalHeight) * 100.0;
                double widthPercent = ((double) rect.width / originalWidth) * 100.0;
                double heightPercent = ((double) rect.height / originalHeight) * 100.0;

                StallConfiguration config = new StallConfiguration(
                        rule.category(),
                        xPercent,
                        yPercent,
                        widthPercent,
                        heightPercent
                ).withPrecision(2);

                configurations.add(config);
            }

            log.debug("Category [{}]: identified {} bounding sub-blocks", rule.category(), configurations.size());
            return configurations;

        } finally {
            // Step 5: Memory Lifecycle - Explicitly release all native MatOfPoint contours, hierarchy, and masks
            for (MatOfPoint contour : contours) {
                contour.release();
            }
            hierarchy.release();
            if (closeKernel != null) closeKernel.release();
            if (cleaned != null) cleaned.release();
            if (separated != null) separated.release();
            if (mask != null) mask.release();
        }
    }

    /**
     * Determines whether an oversized bounding box contains multiple distinct text columns
     * (such as two stall numbers placed side-by-side in a combined CAD block).
     */
    private boolean hasMultipleTextColumns(Mat gray, Rect rect) {
        if (gray == null || gray.empty() || rect.width <= 0 || rect.height <= 0) {
            return false;
        }

        // Clamp ROI safely inside image bounds
        int safeX = Math.max(0, rect.x);
        int safeY = Math.max(0, rect.y);
        int safeW = Math.min(rect.width, gray.cols() - safeX);
        int safeH = Math.min(rect.height, gray.rows() - safeY);

        if (safeW <= 10 || safeH <= 10) {
            return false;
        }

        Mat crop = null;
        Mat thresh = null;
        Mat hier = null;
        List<MatOfPoint> contours = new ArrayList<>();

        try {
            crop = gray.submat(new Rect(safeX, safeY, safeW, safeH));
            thresh = new Mat();
            // Threshold dark text characters against lighter colored backgrounds
            Imgproc.threshold(crop, thresh, 85, 255, Imgproc.THRESH_BINARY_INV);

            hier = new Mat();
            Imgproc.findContours(thresh, contours, hier, Imgproc.RETR_EXTERNAL, Imgproc.CHAIN_APPROX_SIMPLE);

            int leftCount = 0;
            int rightCount = 0;
            int midX = crop.cols() / 2;

            for (MatOfPoint c : contours) {
                Rect r = Imgproc.boundingRect(c);
                // Filter character-sized contours (letters, digits)
                if (r.width >= 4 && r.height >= 8 && r.height <= 30) {
                    int cx = r.x + r.width / 2;
                    if (cx < midX - 5) {
                        leftCount++;
                    } else if (cx > midX + 5) {
                        rightCount++;
                    }
                }
            }

            return leftCount >= 1 && rightCount >= 1;

        } finally {
            for (MatOfPoint c : contours) {
                c.release();
            }
            if (hier != null) hier.release();
            if (thresh != null) thresh.release();
            if (crop != null) crop.release();
        }
    }
}
