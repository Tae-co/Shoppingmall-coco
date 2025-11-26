package com.shoppingmallcoco.project.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import com.shoppingmallcoco.project.dto.product.CategoryDTO;
import com.shoppingmallcoco.project.repository.product.CategoryRepository;

@RestController
@CrossOrigin("*")
@RequestMapping("/api")
public class CategoryApiController {

    @Autowired
    private CategoryRepository catRepo;

    /**
     * API: 카테고리 목록 조회
     * GET /api/categories
     */
    @GetMapping("/categories")
    public List<CategoryDTO> getAllCategories() {
        return catRepo.findAll(Sort.by(Sort.Direction.ASC, "categoryNo")).stream()
                .map(CategoryDTO::new)
                .collect(Collectors.toList());
    }
}