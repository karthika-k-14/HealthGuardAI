package com.healthguard.admin.controller;

import com.healthguard.admin.entity.HealthArticle;
import com.healthguard.admin.service.HealthArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class HealthArticleController {

    private final HealthArticleService articleService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEALTH_OFFICER')")
    public ResponseEntity<HealthArticle> createArticle(@RequestBody HealthArticle article) {
        HealthArticle created = articleService.createArticle(article);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEALTH_OFFICER')")
    public ResponseEntity<HealthArticle> updateArticle(@PathVariable("id") Long id, @RequestBody HealthArticle article) {
        HealthArticle updated = articleService.updateArticle(id, article);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/publish")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEALTH_OFFICER')")
    public ResponseEntity<HealthArticle> publishArticle(@PathVariable("id") Long id) {
        return ResponseEntity.ok(articleService.publishArticle(id));
    }

    @PutMapping("/{id}/archive")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEALTH_OFFICER')")
    public ResponseEntity<HealthArticle> archiveArticle(@PathVariable("id") Long id) {
        return ResponseEntity.ok(articleService.archiveArticle(id));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<HealthArticle>> searchArticles(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        return ResponseEntity.ok(articleService.searchArticles(keyword, category, status, PageRequest.of(page, size)));
    }

    @GetMapping
    public ResponseEntity<List<HealthArticle>> getArticles(
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "status", required = false) String status) {
        return ResponseEntity.ok(articleService.getAllArticles(category, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HealthArticle> getArticleById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(articleService.getArticleById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEALTH_OFFICER')")
    public ResponseEntity<Void> deleteArticle(@PathVariable("id") Long id) {
        articleService.deleteArticle(id);
        return ResponseEntity.noContent().build();
    }
}

