package com.shoppingmallcoco.project.service.review;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class LocalFileUploadService implements FileUploadService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public String upload(MultipartFile file) {
        if (file.isEmpty()) {
            return null;
        }

        String originalFilename = file.getOriginalFilename();
        String uuid = UUID.randomUUID().toString();

        String uniqueFileName = uuid + "_" + originalFilename;

        try {
            Path imagePath = Paths.get(uploadDir + uniqueFileName);
            Files.copy(file.getInputStream(), imagePath);

            return uniqueFileName;
        } catch (IOException e) {
            throw new RuntimeException("파일 업로드에 실패했습니다.", e);
        }
    }

    @Override
    public void delete(String fileNameOrUrl) {
        try {
            String fileName = fileNameOrUrl.startsWith("/images/")
                ? fileNameOrUrl.substring("/images/".length())
                : fileNameOrUrl;

            Path imagePath = Paths.get(uploadDir + fileName);
            Files.deleteIfExists(imagePath);
        }catch (IOException e) {
            throw new RuntimeException("파일 삭제에 실패했습니다.", e);
        }
        }
    }
