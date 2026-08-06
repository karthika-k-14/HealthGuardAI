package com.healthguard.controller;

import com.healthguard.dto.ProfileCompleteRequest;
import com.healthguard.dto.UserSummaryResponse;
import com.healthguard.security.UserPrincipal;
import com.healthguard.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * The "Complete Profile" step shown once after a user's first successful
 * login, if their profile isn't complete yet. Collects everything
 * registration deliberately skips (address, medical history, geo-location,
 * etc.) - see {@link ProfileCompleteRequest}.
 */
@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
@Tag(name = "Profile", description = "User profile retrieval and completion endpoints")
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile", description = "Returns the summary profile of the currently logged-in user.")
    public UserSummaryResponse me(@AuthenticationPrincipal UserPrincipal principal) {
        return profileService.getCurrentUser(principal.getUser());
    }

    @PutMapping("/complete")
    @Operation(summary = "Complete user profile", description = "Updates and completes optional profile details after first login.")
    public UserSummaryResponse completeProfile(@AuthenticationPrincipal UserPrincipal principal,
                                                @Valid @RequestBody ProfileCompleteRequest request) {
        return profileService.completeProfile(principal.getUser(), request);
    }
}

