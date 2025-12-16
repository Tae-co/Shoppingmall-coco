package com.shoppingmallcoco.project.service.review;

import com.shoppingmallcoco.project.entity.review.Tag;
import com.shoppingmallcoco.project.repository.review.TagRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;

    public List<Tag> getTagList(){
        return tagRepository.findAll();
    }

}
