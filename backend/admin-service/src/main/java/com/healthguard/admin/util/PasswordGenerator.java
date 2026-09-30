package com.healthguard.admin.util;

import java.security.SecureRandom;

public class PasswordGenerator {

    private static final SecureRandom random = new SecureRandom();

    public static String generateTemporaryPassword() {
        return "Temp@" + (1000 + random.nextInt(9000));
    }
}
