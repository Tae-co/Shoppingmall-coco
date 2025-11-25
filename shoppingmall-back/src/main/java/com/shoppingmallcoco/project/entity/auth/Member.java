package com.shoppingmallcoco.project.entity.auth;

import com.shoppingmallcoco.project.entity.mypage.SkinProfile;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicInsert;

import java.time.LocalDateTime;

import com.shoppingmallcoco.project.dto.auth.MemberSignupDto;

@Entity
@Getter
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@DynamicInsert // DB 컬럼의 기본값 적용 가능하도록 필드값이 null인 경우 insert에서 제외
@Table(name = "member")
public class Member {

    @Id
    @SequenceGenerator(
            name = "seq_member_memNo",
            sequenceName = "seq_member_memNo",
            allocationSize = 1
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "seq_member_memNo"
    )
    @Column(name = "memNo")
    private Long memNo;

    @Column(name = "memId", nullable = false, unique = true, length = 50)
    private String memId;

    @Column(name = "memNickname", nullable = false, unique = true, length = 100)
    private String memNickname;

    @Column(name = "memPwd", nullable = false, length = 255)
    private String memPwd;

    @Column(name = "memName", length = 100)
    private String memName;

    @Column(name = "memMail", length = 100)
    private String memMail;

    @Column(name = "memHp", length = 100)
    private String memHp;

    @Column(name = "memZipcode", length = 100)
    private String memZipcode;

    @Column(name = "memAddress1", length = 100)
    private String memAddress1;

    @Column(name = "memAddress2", length = 100)
    private String memAddress2;

    @CreationTimestamp
    @Column(name = "memJoindate")
    private LocalDateTime memJoindate;

    @Column(name = "role", length = 20)
    @Enumerated(EnumType.STRING)
    private Role role = Role.USER;

    @OneToOne(mappedBy = "member", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private SkinProfile skin;

    @Column(name = "point")
    private Long point = 0L;

    public enum Role {
        USER, ADMIN
    }

    // DTO를 Entity로 변환하는 메서드
    public static Member toEntity(MemberSignupDto dto) {
        return Member.builder()
                .memId(dto.getMemId())
                .memPwd(dto.getMemPwd())
                .memNickname(dto.getMemNickname())
                .memName(dto.getMemName())
                .memMail(dto.getMemMail())
                .memHp(dto.getMemHp())
                .memZipcode(dto.getMemZipcode())
                .memAddress1(dto.getMemAddress1())
                .memAddress2(dto.getMemAddress2())
                .build();
    }
}

