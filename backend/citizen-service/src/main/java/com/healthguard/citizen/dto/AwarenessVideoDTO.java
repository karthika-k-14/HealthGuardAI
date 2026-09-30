package com.healthguard.citizen.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AwarenessVideoDTO {
    private String id;
    private String title;
    private String channel;
    private String duration;
    private String thumbnail;
    private String language;
    private String youtubeUrl;
    private String embedUrl;
}
