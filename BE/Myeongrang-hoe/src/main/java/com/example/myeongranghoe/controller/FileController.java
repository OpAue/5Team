package com.example.myeongranghoe.controller;

import com.example.myeongranghoe.config.UserContext;
import com.example.myeongranghoe.service.FileStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class FileController {
    private final FileStorageService fileStorageService;

    public FileController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> upload(@RequestParam("file") MultipartFile file) {
        UserContext.require();
        String path = fileStorageService.store(file);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "url", path,
                "message", "이미지를 업로드했어요."
        ));
    }
}
