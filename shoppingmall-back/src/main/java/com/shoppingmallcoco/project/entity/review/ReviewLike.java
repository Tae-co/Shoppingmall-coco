package com.shoppingmallcoco.project.entity.review;

import com.shoppingmallcoco.project.entity.auth.Member;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
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
@Table(uniqueConstraints = {
    @UniqueConstraint(
        name = "uk_reviewLike",
        columnNames = {"memNo", "reviewNo"}
    )
}
)
public class ReviewLike {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "reviewLike_seq_gen")
    @SequenceGenerator(
        name = "reviewLike_seq_gen",
        sequenceName = "reviewLike_SEQ",
        allocationSize = 1
    )
    private Long likeNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "memNo")
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewNo")
    private Review review;

    public static ReviewLike toEntity(Member member, Review review) {
        return ReviewLike.builder().member(member).review(review).build();
    }

}
