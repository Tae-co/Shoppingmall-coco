package com.shoppingmallcoco.project.entity.review;

import com.shoppingmallcoco.project.dto.review.ReviewTagMapDTO;
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
public class ReviewTagMap {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "reviewTagMap_seq_gen")
    @SequenceGenerator(
        name = "reviewTagMap_seq_gen",
        sequenceName = "reviewTagMap_SEQ",
        allocationSize = 1
    )
    private Long reviewTagNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewNo")
    private Review review;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tagNo")
    private Tag tag;

    public static ReviewTagMap toEntity(Review review, Tag tag) {
        return ReviewTagMap.builder().review(review).tag(tag).build();
    }

}
