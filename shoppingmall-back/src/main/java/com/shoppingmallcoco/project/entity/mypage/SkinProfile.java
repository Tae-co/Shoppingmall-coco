package com.shoppingmallcoco.project.entity.mypage;

import com.shoppingmallcoco.project.entity.auth.Member;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "SKIN")
public class SkinProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "skin_seq_gen")
    @SequenceGenerator(
            name = "skin_seq_gen",
            sequenceName = "SKIN_SEQ",
            allocationSize = 1
    )
    @Column(name = "PROFILENO")
    private Long profileNo;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MEMNO", unique = true)
    private Member member;

    @Column(name = "SKINTYPE")
    private String skinType;

    @Column(name = "SKINCONCERN")
    private String skinConcern;

    @Column(name = "PERSONALCOLOR")
    private String personalColor;
}
