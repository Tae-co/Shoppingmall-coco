package com.shoppingmallcoco.project.service.review;

import org.springframework.web.multipart.MultipartFile;

public interface FileUploadService {
    String upload(MultipartFile file);

    void delete(String fileName);
}


