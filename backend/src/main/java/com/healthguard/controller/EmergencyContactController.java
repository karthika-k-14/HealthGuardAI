package com.healthguard.controller;

import com.healthguard.dto.EmergencyContactRequest;
import com.healthguard.dto.EmergencyContactResponse;
import com.healthguard.entity.Citizen;
import com.healthguard.exception.BadRequestException;
import com.healthguard.security.UserPrincipal;
import com.healthguard.service.EmergencyContactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Emergency Contact Management: add/update/delete/list/search a citizen's
 * personal emergency contacts. Kept as its own controller (separate from
 * {@code CitizenController}) but under the same "/citizen/**" base path,
 * which is already restricted to ROLE_CITIZEN by {@code SecurityConfig}.
 */
@RestController
@RequestMapping("/citizen/emergency-contacts")
@RequiredArgsConstructor
@Tag(name = "Emergency Contacts", description = "Citizen emergency contact management")
public class EmergencyContactController {

    private final EmergencyContactService emergencyContactService;

    @GetMapping
    @Operation(summary = "List the authenticated citizen's emergency contacts")
    public ResponseEntity<List<EmergencyContactResponse>> list(@AuthenticationPrincipal UserPrincipal principal) {
        Citizen citizen = requireCitizen(principal);
        return ResponseEntity.ok(emergencyContactService.listContacts(citizen));
    }

    @GetMapping("/search")
    @Operation(summary = "Search the authenticated citizen's emergency contacts by name, relationship, or phone")
    public ResponseEntity<List<EmergencyContactResponse>> search(@AuthenticationPrincipal UserPrincipal principal,
                                                                   @RequestParam(required = false) String keyword) {
        Citizen citizen = requireCitizen(principal);
        return ResponseEntity.ok(emergencyContactService.searchContacts(citizen, keyword));
    }

    @PostMapping
    @Operation(summary = "Add an emergency contact")
    public ResponseEntity<EmergencyContactResponse> add(@AuthenticationPrincipal UserPrincipal principal,
                                                          @Valid @RequestBody EmergencyContactRequest request) {
        Citizen citizen = requireCitizen(principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(emergencyContactService.addContact(citizen, request));
    }

    @PutMapping("/{contactId}")
    @Operation(summary = "Update an emergency contact")
    public ResponseEntity<EmergencyContactResponse> update(@AuthenticationPrincipal UserPrincipal principal,
                                                             @PathVariable Long contactId,
                                                             @Valid @RequestBody EmergencyContactRequest request) {
        Citizen citizen = requireCitizen(principal);
        return ResponseEntity.ok(emergencyContactService.updateContact(citizen, contactId, request));
    }

    @DeleteMapping("/{contactId}")
    @Operation(summary = "Remove an emergency contact")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserPrincipal principal,
                                        @PathVariable Long contactId) {
        Citizen citizen = requireCitizen(principal);
        emergencyContactService.deleteContact(citizen, contactId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Every endpoint here is already restricted to ROLE_CITIZEN by
     * {@code SecurityConfig}, so this cast should always succeed; the
     * explicit check just guards against that invariant ever changing
     * without also updating this controller.
     */
    private Citizen requireCitizen(UserPrincipal principal) {
        if (principal.getUser() instanceof Citizen citizen) {
            return citizen;
        }
        throw new BadRequestException("Only citizens can access this resource");
    }
}
