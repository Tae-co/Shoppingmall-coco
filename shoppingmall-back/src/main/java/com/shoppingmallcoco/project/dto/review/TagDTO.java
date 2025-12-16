package com.shoppingmallcoco.project.dto.review;

import com.shoppingmallcoco.project.entity.review.Tag;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TagDTO {

    private Long tagNo; // 태그 고유 번호
    private String tagName; // 태그 이름
    private String tagStatus; // 태그 상태 (장점, 단점)

    // Entity -> Dto
    public static TagDTO toDTO(Tag tag) {
        return TagDTO.builder().tagNo(tag.getTagNo()).tagName(tag.getTagName())
            .tagStatus(tag.getTagStatus()).build();
    }
}
