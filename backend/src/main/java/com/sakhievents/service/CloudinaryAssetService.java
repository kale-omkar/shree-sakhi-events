package com.sakhievents.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Deletes images uploaded to Cloudinary using server-side credentials.
 * Non-Cloudinary URLs are ignored because this service cannot own their lifecycle.
 */
@Service
public class CloudinaryAssetService {

    private static final Pattern VERSION_SEGMENT = Pattern.compile("v\\d+");
    private static final String CLOUDINARY_HOST_SUFFIX = ".cloudinary.com";

    private final RestClient restClient;
    private final String cloudName;
    private final String apiKey;
    private final String apiSecret;

    public CloudinaryAssetService(
            @Value("${cloudinary.cloud-name:}") String cloudName,
            @Value("${cloudinary.api-key:}") String apiKey,
            @Value("${cloudinary.api-secret:}") String apiSecret) {
        this.restClient = RestClient.builder().build();
        this.cloudName = cloudName;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }

    public void deleteAssets(List<String> urls) {
        LinkedHashSet<String> publicIds = new LinkedHashSet<>();
        for (String url : urls) {
            extractPublicId(url).ifPresent(publicIds::add);
        }

        if (publicIds.isEmpty()) {
            return;
        }
        requireConfiguration();
        for (String publicId : publicIds) {
            deleteAsset(publicId);
        }
    }

    private void deleteAsset(String publicId) {
        long timestamp = Instant.now().getEpochSecond();
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("public_id", publicId);
        form.add("timestamp", Long.toString(timestamp));
        form.add("api_key", apiKey);
        form.add("signature", sign(publicId, timestamp));

        String response = restClient.post()
                .uri("https://api.cloudinary.com/v1_1/{cloudName}/image/destroy", cloudName)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(String.class);

        if (response == null || !(response.contains("\"result\":\"ok\"")
                || response.contains("\"result\":\"not found\""))) {
            throw new IllegalStateException("Cloudinary did not confirm deletion for asset " + publicId);
        }
    }

    private String sign(String publicId, long timestamp) {
        String payload = "public_id=" + publicId + "&timestamp=" + timestamp + apiSecret;
        try {
            byte[] digest = MessageDigest.getInstance("SHA-1")
                    .digest(payload.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(digest.length * 2);
            for (byte value : digest) {
                hex.append(String.format("%02x", value));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-1 signing is unavailable", ex);
        }
    }

    private void requireConfiguration() {
        if (cloudName.isBlank() || apiKey.isBlank() || apiSecret.isBlank()) {
            throw new IllegalStateException(
                    "Cloudinary credentials are required to delete uploaded event images");
        }
    }

    private java.util.Optional<String> extractPublicId(String url) {
        if (url == null || url.isBlank()) {
            return java.util.Optional.empty();
        }
        try {
            URI uri = URI.create(url);
            String host = uri.getHost();
            if (host == null || !(host.equals("cloudinary.com") || host.endsWith(CLOUDINARY_HOST_SUFFIX))) {
                return java.util.Optional.empty();
            }

            String[] segments = uri.getPath().split("/");
            int uploadIndex = indexOf(segments, "upload");
            if (uploadIndex < 0 || uploadIndex == segments.length - 1
                    || !"image".equals(segments[Math.max(0, uploadIndex - 1)])) {
                return java.util.Optional.empty();
            }

            List<String> assetSegments = new ArrayList<>();
            for (int i = uploadIndex + 1; i < segments.length; i++) {
                if (!segments[i].isBlank()) {
                    assetSegments.add(URLDecoder.decode(segments[i], StandardCharsets.UTF_8));
                }
            }
            if (!assetSegments.isEmpty() && VERSION_SEGMENT.matcher(assetSegments.get(0)).matches()) {
                assetSegments.remove(0);
            }
            if (assetSegments.isEmpty()) {
                return java.util.Optional.empty();
            }

            int last = assetSegments.size() - 1;
            String filename = assetSegments.get(last);
            int extension = filename.lastIndexOf('.');
            if (extension > 0) {
                assetSegments.set(last, filename.substring(0, extension));
            }
            return java.util.Optional.of(String.join("/", assetSegments));
        } catch (IllegalArgumentException ex) {
            return java.util.Optional.empty();
        }
    }

    private int indexOf(String[] values, String target) {
        for (int i = 0; i < values.length; i++) {
            if (target.equals(values[i])) {
                return i;
            }
        }
        return -1;
    }
}
