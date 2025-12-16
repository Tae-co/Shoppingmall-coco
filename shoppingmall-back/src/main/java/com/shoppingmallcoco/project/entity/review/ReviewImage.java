package com.shoppingmallcoco.project.entity.review;

import com.shoppingmallcoco.project.dto.review.ReviewImageDTO;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
public class ReviewImage {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "reviewImage_seq_gen")
    @SequenceGenerator(
        name = "reviewImage_seq_gen",
        sequenceName = "reviewImage_SEQ",
        allocationSize = 1
    )
    private long reviewImageNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewNo")
    private Review review;

    @Column(nullable = false)
    private String imageUrl;

    public static ReviewImage toEntity(String imageUrl, Review review) {
        return ReviewImage.builder().review(review).imageUrl(imageUrl).build();
    }


}
