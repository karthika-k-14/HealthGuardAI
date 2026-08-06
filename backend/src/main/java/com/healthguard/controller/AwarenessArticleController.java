package com.healthguard.controller;

import com.healthguard.dto.AwarenessArticleRequest;
import com.healthguard.dto.AwarenessArticleResponse;
import com.healthguard.service.AwarenessArticleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Awareness Article CRUD endpoints.
 * <p>
 * Reads ({@code /awareness-articles/**}) are not under "/admin/**",
 * "/citizen/**", etc. so they fall to the "anyRequest().authenticated()"
 * rule in {@code SecurityConfig} - reachable by any authenticated role
 * (citizens browsing articles, in particular). Writes
 * ({@code /admin/awareness-articles/**}) are covered by the existing
 * "/admin/**" -> ROLE_ADMIN matcher.
 */
@RestController
@RequiredArgsConstructor
@Tag(name = "Awareness Articles", description = "Awareness article catalog management and search")
public class AwarenessArticleController {

    private final AwarenessArticleService awarenessArticleService;

    @GetMapping("/awareness-articles")
    @Operation(summary = "List all awareness articles", description = "Returns every published awareness article.")
    public ResponseEntity<List<AwarenessArticleResponse>> getAllArticles() {
        return ResponseEntity.ok(awarenessArticleService.getAllArticles());
    }

    @GetMapping("/awareness-articles/search")
    @Operation(summary = "Search awareness articles", description = "Search articles by title/content query and category filter.")
    public ResponseEntity<List<AwarenessArticleResponse>> searchArticles(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(awarenessArticleService.searchArticles(query, category));
    }

    @GetMapping("/awareness-articles/{articleId}")
    @Operation(summary = "Get awareness article by ID", description = "Returns details for a single awareness article.")
    public ResponseEntity<AwarenessArticleResponse> getArticleById(@PathVariable Long articleId) {
        return ResponseEntity.ok(awarenessArticleService.getArticleById(articleId));
    }

    @PostMapping("/admin/awareness-articles")
    @Operation(summary = "Create an awareness article", description = "Creates a new health awareness article (Admin only).")
    public ResponseEntity<AwarenessArticleResponse> createArticle(@Valid @RequestBody AwarenessArticleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(awarenessArticleService.createArticle(request));
    }

    @PutMapping("/admin/awareness-articles/{articleId}")
    @Operation(summary = "Update an awareness article", description = "Updates an existing awareness article (Admin only).")
    public ResponseEntity<AwarenessArticleResponse> updateArticle(@PathVariable Long articleId,
                                                                    @Valid @RequestBody AwarenessArticleRequest request) {
        return ResponseEntity.ok(awarenessArticleService.updateArticle(articleId, request));
    }

    @DeleteMapping("/admin/awareness-articles/{articleId}")
    @Operation(summary = "Delete an awareness article", description = "Deletes an awareness article by ID (Admin only).")
    public ResponseEntity<Void> deleteArticle(@PathVariable Long articleId) {
        awarenessArticleService.deleteArticle(articleId);
        return ResponseEntity.noContent().build();
    }
}

