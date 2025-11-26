package com.shoppingmallcoco.project.entity.comate;

import com.shoppingmallcoco.project.entity.auth.Member;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "FOLLOW")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Follow {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "follow_seq_gen")
    @SequenceGenerator(name = "follow_seq_gen", sequenceName = "FOLLOW_SEQ", allocationSize = 1)
    @Column(name = "FOLLOWNO")
    private Long followNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "FOLLOWERNO")
    private Member follower;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "FOLLOWINGNO")
    private Member following;
}
