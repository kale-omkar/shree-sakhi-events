package com.sakhievents;

import com.sakhievents.service.EventService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;

@SpringBootApplication
public class SakhiEventsApplication {

    public static void main(String[] args) {
        loadEnvFile();
        SpringApplication.run(SakhiEventsApplication.class, args);
    }

    private static void loadEnvFile() {
        String[] candidatePaths = {
            ".env",
            "backend/.env",
            "../.env",
            "../../.env"
        };

        for (String path : candidatePaths) {
            File envFile = new File(path);
            if (envFile.exists() && envFile.isFile()) {
                try (BufferedReader reader = new BufferedReader(new FileReader(envFile))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
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
                            if (System.getProperty(key) == null) {
                                System.setProperty(key, value);
                            }
                            if ("ADMIN_API_KEY".equalsIgnoreCase(key) && System.getProperty("admin.api.key") == null) {
                                System.setProperty("admin.api.key", value);
                            } else if ("admin.api.key".equalsIgnoreCase(key) && System.getProperty("ADMIN_API_KEY") == null) {
                                System.setProperty("ADMIN_API_KEY", value);
                            }
                        }
                    }
                    System.out.println(">>> Loaded environment from: " + envFile.getAbsolutePath());
                    return;
                } catch (IOException e) {
                    System.err.println("Warning: Failed to read .env file at " + path + ": " + e.getMessage());
                }
            }
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
