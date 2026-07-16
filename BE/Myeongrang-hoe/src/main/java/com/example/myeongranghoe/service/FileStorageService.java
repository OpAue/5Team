package com.example.myeongranghoe.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {
    private static final Set<String> ALLOWED = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"
    );
    private static final long MAX_BYTES = 2L * 1024 * 1024;

    private final Path root;

    public FileStorageService(@Value("${app.upload.dir:./data/uploads}") String uploadDir) {
        this.root = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.root);
        } catch (IOException e) {
            throw new IllegalStateException("업로드 디렉터리를 만들 수 없어요: " + this.root, e);
        }
    }

    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어 있어요.");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new IllegalArgumentException("이미지는 2MB 이하만 올릴 수 있어요.");
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        if (!ALLOWED.contains(contentType)) {
            throw new IllegalArgumentException("이미지 파일(jpg/png/webp/gif)만 올릴 수 있어요.");
        }
        String ext = extensionOf(contentType, file.getOriginalFilename());
        String name = UUID.randomUUID().toString().replace("-", "") + ext;
        Path target = root.resolve(name);
        try {
            Files.copy(file.getInputStream(), target);
        } catch (IOException e) {
            throw new IllegalArgumentException("파일 저장에 실패했어요.");
        }
        // 클라이언트에서 API_BASE + 경로로 접근
        return "/uploads/" + name;
    }

    public Path resolve(String filename) {
        Path p = root.resolve(filename).normalize();
        if (!p.startsWith(root)) {
            throw new IllegalArgumentException("잘못된 경로예요.");
        }
        return p;
    }

    private static String extensionOf(String contentType, String original) {
        return switch (contentType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> {
                if (original != null) {
                    String lower = original.toLowerCase(Locale.ROOT);
                    if (lower.endsWith(".png")) yield ".png";
                    if (lower.endsWith(".webp")) yield ".webp";
                    if (lower.endsWith(".gif")) yield ".gif";
                }
                yield ".jpg";
            }
        };
    }
}
