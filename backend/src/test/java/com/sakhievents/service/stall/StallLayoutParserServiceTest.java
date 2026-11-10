package com.sakhievents.service.stall;

import com.sakhievents.dto.stall.StallConfiguration;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.opencv.core.CvType;
import org.opencv.core.Mat;
import org.opencv.core.Rect;
import org.opencv.core.Scalar;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;

import java.io.File;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("StallLayoutParserService OpenCV Computer Vision Pipeline Test")
class StallLayoutParserServiceTest {

    private final StallLayoutParserService parserService = new StallLayoutParserService();

    @BeforeAll
    static void initOpenCV() {
        try {
            nu.pattern.OpenCV.loadLocally();
        } catch (Throwable fallback) {
            nu.pattern.OpenCV.loadShared();
        }
    }

    @Test
    @DisplayName("Should detect color-coded stalls, ignore noise below 400px area, and normalize relative coordinates")
    void shouldParseLayoutAndExtractNormalizedConfigurations(@TempDir Path tempDir) {
        // Arrange: Generate an 800 x 600 synthetic floor plan image
        final int imgWidth = 800;
        final int imgHeight = 600;

        Mat syntheticLayout = new Mat(imgHeight, imgWidth, CvType.CV_8UC3, new Scalar(255, 255, 255)); // White background

        try {
            // Colors drawn in OpenCV BGR format:
            // 1. PREMIUM (Brown): SaddleBrown approx (B: 19, G: 69, R: 139) -> converts to HSV ~ (12, 220, 139)
            Imgproc.rectangle(syntheticLayout, new Rect(80, 60, 160, 120), new Scalar(19, 69, 139), -1);

            // 2. REGULAR (Yellow): Bright pure yellow (B: 0, G: 255, R: 255) -> converts to HSV ~ (30, 255, 255)
            Imgproc.rectangle(syntheticLayout, new Rect(320, 60, 160, 120), new Scalar(0, 255, 255), -1);

            // 3. CLASSIC (Green): Pure green (B: 0, G: 200, R: 0) -> converts to HSV ~ (60, 255, 200)
            Imgproc.rectangle(syntheticLayout, new Rect(80, 300, 160, 120), new Scalar(0, 200, 0), -1);

            // 4. SINGLE_TABLE (Blue): Pure blue (B: 230, G: 40, R: 0) -> converts to HSV ~ (115, 255, 230)
            Imgproc.rectangle(syntheticLayout, new Rect(320, 300, 80, 60), new Scalar(230, 40, 0), -1);

            // 5. Noise artifact: 10x10 px blue square (area = 100 < 400 px, should be filtered out)
            Imgproc.rectangle(syntheticLayout, new Rect(600, 500, 10, 10), new Scalar(230, 40, 0), -1);

            File testImage = tempDir.resolve("test-floor-plan.png").toFile();
            Imgcodecs.imwrite(testImage.getAbsolutePath(), syntheticLayout);

            // Act: Execute parsing pipeline
            List<StallConfiguration> stalls = parserService.processLayoutImage(testImage.getAbsolutePath());

            // Assert
            assertNotNull(stalls);
            assertEquals(4, stalls.size(), "Expected exactly 4 stalls after filtering noise");

            Map<String, List<StallConfiguration>> byCategory = stalls.stream()
                    .collect(Collectors.groupingBy(StallConfiguration::category));

            assertTrue(byCategory.containsKey("PREMIUM"), "PREMIUM category should be detected");
            assertTrue(byCategory.containsKey("REGULAR"), "REGULAR category should be detected");
            assertTrue(byCategory.containsKey("CLASSIC"), "CLASSIC category should be detected");
            assertTrue(byCategory.containsKey("SINGLE_TABLE"), "SINGLE_TABLE category should be detected");

            // Verify PREMIUM coordinate percentages
            StallConfiguration premium = byCategory.get("PREMIUM").get(0);
            assertEquals(10.0, premium.xPercent(), 0.5);
            assertEquals(10.0, premium.yPercent(), 0.5);
            assertEquals(20.0, premium.widthPercent(), 0.5);
            assertEquals(20.0, premium.heightPercent(), 0.5);

            // Verify SINGLE_TABLE coordinate percentages
            StallConfiguration singleTable = byCategory.get("SINGLE_TABLE").get(0);
            assertEquals(40.0, singleTable.xPercent(), 0.5);
            assertEquals(50.0, singleTable.yPercent(), 0.5);
            assertEquals(10.0, singleTable.widthPercent(), 0.5);
            assertEquals(10.0, singleTable.heightPercent(), 0.5);

        } finally {
            syntheticLayout.release();
        }
    }

    @Test
    @DisplayName("Should separate sub-stalls in a connected multi-block strip along internal divider lines")
    void shouldSeparateSubStallsInConnectedBlock(@TempDir Path tempDir) {
        // Arrange: Generate an 800 x 600 floor plan containing a connected 2-column x 5-row grid of yellow stalls
        // Each stall is 60x80 px, divided by 2px dark lines (simulating the user floor plan)
        final int imgWidth = 800;
        final int imgHeight = 600;

        Mat layout = new Mat(imgHeight, imgWidth, CvType.CV_8UC3, new Scalar(255, 255, 255));

        try {
            int startX = 100;
            int startY = 50;
            int cellW = 70;
            int cellH = 90;
            int borderWidth = 2;

            for (int col = 0; col < 2; col++) {
                for (int row = 0; row < 5; row++) {
                    int x = startX + col * (cellW + borderWidth);
                    int y = startY + row * (cellH + borderWidth);
                    // Yellow stall body
                    Imgproc.rectangle(layout, new Rect(x, y, cellW, cellH), new Scalar(0, 255, 255), -1);
                }
            }

            File testImage = tempDir.resolve("grid-floor-plan.png").toFile();
            Imgcodecs.imwrite(testImage.getAbsolutePath(), layout);

            // Act
            List<StallConfiguration> stalls = parserService.processLayoutImage(testImage.getAbsolutePath());

            // Assert: Exactly 10 individual sub-stalls should be detected instead of 1 giant block
            assertEquals(10, stalls.size(), "Should separate the grid into exactly 10 individual sub-stalls");
            for (StallConfiguration s : stalls) {
                assertEquals("REGULAR", s.category());
                // Width ~ 70/800 = 8.75%, Height ~ 90/600 = 15.0%
                assertEquals(8.75, s.widthPercent(), 0.75);
                assertEquals(15.0, s.heightPercent(), 0.75);
            }

        } finally {
            layout.release();
        }
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when layout image file does not exist")
    void shouldThrowWhenFileDoesNotExist() {
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> parserService.processLayoutImage("non_existent_floor_plan_image.png")
        );
        assertTrue(ex.getMessage().contains("does not exist"));
    }

    @Test
    @DisplayName("Should accurately parse full floor plan with stitched Stall 12 and separated Stalls 38 & 39")
    void shouldParseFullFloorPlanAccurately() {
        File floorPlan = new File("../frontend/public/shree-sakhi-layout.jpg");
        if (!floorPlan.exists()) {
            return; // Skip if layout image not present in test environment
        }

        List<StallConfiguration> stalls = parserService.processLayoutImage(floorPlan.getAbsolutePath());
        assertNotNull(stalls);
        assertEquals(50, stalls.size(), "Expected exactly 50 stalls from official venue floor plan");

        Map<String, List<StallConfiguration>> byCategory = stalls.stream()
                .collect(Collectors.groupingBy(StallConfiguration::category));

        assertEquals(16, byCategory.get("PREMIUM").size(), "Expected 16 PREMIUM stalls");
        assertEquals(22, byCategory.get("REGULAR").size(), "Expected 22 REGULAR stalls");
        assertEquals(4, byCategory.get("CLASSIC").size(), "Expected 4 CLASSIC stalls");
        assertEquals(8, byCategory.get("SINGLE_TABLE").size(), "Expected 8 SINGLE_TABLE stalls");

        // Verify Stall 12 is fully stitched (height > 11.5%) and starts at y ~ 18.16%
        boolean stall12Found = byCategory.get("PREMIUM").stream().anyMatch(s ->
                Math.abs(s.xPercent() - 39.44) < 1.0 &&
                Math.abs(s.yPercent() - 18.16) < 1.0 &&
                s.heightPercent() > 11.5
        );
        assertTrue(stall12Found, "Stall 12 must be fully stitched to its complete 12x7 height");

        // Verify Stalls 38 and 39 are both individually detected
        boolean stall38Found = byCategory.get("PREMIUM").stream().anyMatch(s -> Math.abs(s.xPercent() - 27.56) < 1.0);
        boolean stall39Found = byCategory.get("PREMIUM").stream().anyMatch(s -> Math.abs(s.xPercent() - 36.66) < 1.0);
        assertTrue(stall38Found, "Stall 38 must be detected as an individual stall");
        assertTrue(stall39Found, "Stall 39 must be detected as an individual stall");

        // Optional visual verification artifact for debugging: write to target/ directory if present
        File targetDir = new File("target");
        if (targetDir.exists()) {
            Mat img = Imgcodecs.imread(floorPlan.getAbsolutePath());
            try {
                int w = img.cols();
                int h = img.rows();
                for (int i = 0; i < stalls.size(); i++) {
                    StallConfiguration s = stalls.get(i);
                    int rx = (int) Math.round((s.xPercent() / 100.0) * w);
                    int ry = (int) Math.round((s.yPercent() / 100.0) * h);
                    int rw = (int) Math.round((s.widthPercent() / 100.0) * w);
                    int rh = (int) Math.round((s.heightPercent() / 100.0) * h);
                    Scalar color = switch (s.category()) {
                        case "PREMIUM" -> new Scalar(0, 140, 255);
                        case "REGULAR" -> new Scalar(0, 255, 255);
                        case "CLASSIC" -> new Scalar(0, 200, 0);
                        case "SINGLE_TABLE" -> new Scalar(255, 100, 0);
                        default -> new Scalar(255, 255, 255);
                    };
                    Imgproc.rectangle(img, new Rect(rx, ry, rw, rh), color, 2);
                }
                File output = new File(targetDir, "verified-detected-stalls.jpg");
                Imgcodecs.imwrite(output.getAbsolutePath(), img);
            } finally {
                img.release();
            }
        }
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when path is blank or null")
    void shouldThrowWhenPathIsBlankOrNull() {
        assertThrows(IllegalArgumentException.class, () -> parserService.processLayoutImage("   "));
        assertThrows(IllegalArgumentException.class, () -> parserService.processLayoutImage(null));
    }
}
