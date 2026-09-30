package com.healthguard.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TriageFact {

    private boolean chestPain;
    private boolean chestPressure;
    private boolean shortnessOfBreath;
    private boolean strokeSymptoms;
    private boolean suddenParalysis;
    private boolean suddenWeakness;
    private boolean lossOfConsciousness;
    private boolean seizure;
    private boolean severeBleeding;
    private boolean majorTrauma;
    private boolean severeBurn;
    private boolean severeAllergicReaction;
    private boolean throatSwelling;
    private boolean facialSwelling;
    private boolean suicidalThoughts;
    private boolean selfHarmIntent;

    private boolean backPain;
    private boolean legNumbness;
    private boolean fever;
    private int feverDays;
    private int painScore; // 1-10 scale
    private boolean jaundice;
    private boolean yellowEyes;

    private String riskLevel; // EMERGENCY, HIGH RISK, MODERATE RISK, LOW RISK
    private boolean emergencyAlert;

    @Builder.Default
    private List<String> flags = new ArrayList<>();

    public void addFlag(String flag) {
        if (flags == null) {
            flags = new ArrayList<>();
        }
        flags.add(flag);
    }
}
