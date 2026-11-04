package com.sakhievents;

import com.sakhievents.service.EventService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@SpringBootApplication
@EnableScheduling
public class SakhiEventsApplication {

    public static void main(String[] args) {
        loadEnvFile();
        SpringApplication.run(SakhiEventsApplication.class, args);
    }

    private static void loadEnvFile() {
        String[] candidatePaths = {
            "backend/.env",
            ".env",
            "../backend/.env",
            "../.env",
            "../../.env"
        };

        boolean anyLoaded = false;
        for (String path : candidatePaths) {
            File envFile = new File(path);
            if (envFile.exists() && envFile.isFile()) {
                try (BufferedReader reader = new BufferedReader(new FileReader(envFile, StandardCharsets.UTF_8))) {
                    String line;
                    boolean fileHadEntries = false;
                    while ((line = reader.readLine()) != null) {
                        if (line.startsWith("\uFEFF")) {
                            line = line.substring(1);
                        }
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) {
                            continue;
                        }
                        int eqIdx = line.indexOf('=');
                        if (eqIdx > 0) {
                            String key = line.substring(0, eqIdx).trim();
                            String value = line.substring(eqIdx + 1).trim();
                            if ((value.startsWith("\"") && value.endsWith("\"")) ||
                                (value.startsWith("'") && value.endsWith("'"))) {
                                value = value.substring(1, value.length() - 1);
                            }

                            boolean isPlaceholder = value.startsWith("YOUR_") ||
                                                    "CLOUDINARY_API_SECRET".equalsIgnoreCase(value) ||
                                                    "your_admin_key_here".equalsIgnoreCase(value) ||
                                                    "your_mysql_password_here".equalsIgnoreCase(value);

                            if (!isPlaceholder || System.getProperty(key) == null) {
                                System.setProperty(key, value);
                                fileHadEntries = true;

                                if ("ADMIN_API_KEY".equalsIgnoreCase(key)) {
                                    System.setProperty("admin.api.key", value);
                                } else if ("CLOUDINARY_CLOUD_NAME".equalsIgnoreCase(key)) {
                                    System.setProperty("cloudinary.cloud-name", value);
                                } else if ("CLOUDINARY_API_KEY".equalsIgnoreCase(key)) {
                                    System.setProperty("cloudinary.api-key", value);
                                } else if ("CLOUDINARY_API_SECRET".equalsIgnoreCase(key)) {
                                    System.setProperty("cloudinary.api-secret", value);
                                } else if ("DB_URL".equalsIgnoreCase(key)) {
                                    System.setProperty("spring.datasource.url", value);
                                } else if ("DB_USERNAME".equalsIgnoreCase(key)) {
                                    System.setProperty("spring.datasource.username", value);
                                } else if ("DB_PASSWORD".equalsIgnoreCase(key)) {
                                    System.setProperty("spring.datasource.password", value);
                                } else if ("SERVER_PORT".equalsIgnoreCase(key)) {
                                    System.setProperty("server.port", value);
                                } else if ("STALL_HOLD_TTL_MINUTES".equalsIgnoreCase(key)) {
                                    System.setProperty("stall.hold.ttl.minutes", value);
                                } else if ("STALL_MAX_PER_BOOKING".equalsIgnoreCase(key)) {
                                    System.setProperty("stall.max.per.booking", value);
                                } else if ("STALL_CLEANUP_FIXED_DELAY_MS".equalsIgnoreCase(key)) {
                                    System.setProperty("stall.cleanup.fixedDelay.ms", value);
                                }
                            }
                        }
                    }
                    if (fileHadEntries) {
                        System.out.println(">>> Loaded environment from: " + envFile.getAbsolutePath());
                        anyLoaded = true;
                    }
                } catch (IOException e) {
                    System.err.println("Warning: Failed to read .env file at " + path + ": " + e.getMessage());
                }
            }
        }
        if (!anyLoaded) {
            System.out.println(">>> No .env file found in candidate paths. Falling back to system environment / application.properties.");
        }
    }

    // Seed demo data on startup if DB is empty
    @Bean
    public CommandLineRunner seedData(org.springframework.beans.factory.ObjectProvider<EventService> eventServiceProvider) {
        return args -> {
            EventService eventService = eventServiceProvider.getIfAvailable();
            if (eventService != null) {
                eventService.seedEventsIfEmpty();
            }
        };
    }
}
