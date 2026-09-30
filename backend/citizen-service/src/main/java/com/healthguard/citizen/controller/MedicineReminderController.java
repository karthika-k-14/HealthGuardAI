package com.healthguard.citizen.controller;

import com.healthguard.citizen.entity.MedicineReminder;
import com.healthguard.citizen.service.MedicineReminderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reminders")
@RequiredArgsConstructor
public class MedicineReminderController {

    private final MedicineReminderService reminderService;

    @PostMapping
    public ResponseEntity<MedicineReminder> createReminder(@RequestBody MedicineReminder reminder) {
        MedicineReminder created = reminderService.createReminder(reminder);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/citizen/{citizenId}")
    public ResponseEntity<List<MedicineReminder>> getRemindersByCitizenId(@PathVariable("citizenId") Long citizenId) {
        return ResponseEntity.ok(reminderService.getRemindersByCitizenId(citizenId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicineReminder> getReminderById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(reminderService.getReminderById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicineReminder> updateReminder(@PathVariable("id") Long id, @RequestBody MedicineReminder reminder) {
        return ResponseEntity.ok(reminderService.updateReminder(id, reminder));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<MedicineReminder> markComplete(@PathVariable("id") Long id) {
        return ResponseEntity.ok(reminderService.markComplete(id));
    }

    @PutMapping("/{id}/missed")
    public ResponseEntity<MedicineReminder> markMissed(@PathVariable("id") Long id) {
        return ResponseEntity.ok(reminderService.markMissed(id));
    }

    @GetMapping("/citizen/{citizenId}/adherence")
    public ResponseEntity<java.util.Map<String, Object>> getAdherenceSummary(@PathVariable("citizenId") Long citizenId) {
        return ResponseEntity.ok(reminderService.getAdherenceSummary(citizenId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReminder(@PathVariable("id") Long id) {
        reminderService.deleteReminder(id);
        return ResponseEntity.noContent().build();
    }
}
