package com.shoppingmallcoco.project.entity.review;

import com.shoppingmallcoco.project.dto.review.ReviewDTO;
import com.shoppingmallcoco.project.entity.order.OrderItem;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "review")
@Getter
@NoArgsConstructor
@Builder
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "review_seq_gen")
    @SequenceGenerator(
        name = "review_seq_gen",
        sequenceName = "review_SEQ",
        allocationSize = 1
    )
    @Column(name = "reviewNo")
    private Long reviewNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orderItemNo", nullable = false)
    private OrderItem orderItem;

    @OneToMany(mappedBy = "review", cascade = CascadeType.REMOVE)
    private List<ReviewTagMap> reviewTagMaps = new ArrayList<>();

    @OneToMany(mappedBy = "review", cascade = CascadeType.REMOVE)
    private List<ReviewImage> reviewImages = new ArrayList<>();

    @Column(nullable = false)
    private int rating;

    @Lob
    private String content;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public void update(int rating, String content) {
        this.rating = rating;
        this.content = content;
    }

    public static Review toEntity(OrderItem orderItem, ReviewDTO dto) {
        return Review.builder().orderItem(orderItem).rating(dto.getRating())
            .content(dto.getContent())
            .createdAt(dto.getCreatedAt()).updatedAt(dto.getUpdatedAt()).build();
    }


}
