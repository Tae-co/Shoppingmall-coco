package com.shoppingmallcoco.project.entity.review;

import com.shoppingmallcoco.project.dto.review.TagDTO;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "tag_seq_gen")
    @SequenceGenerator(
        name = "tag_seq_gen",
        sequenceName = "tag_SEQ",
        allocationSize = 1
    )
    private Long tagNo;

    @Column(nullable = false, unique = true)
    private String tagName;

    @Column(nullable = false)
    private String tagStatus;

    public static Tag toEntity(TagDTO dto) {
        return Tag.builder().tagName(dto.getTagName()).tagStatus(dto.getTagStatus()).build();
    }

}
