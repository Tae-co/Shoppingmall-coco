package com.shoppingmallcoco.project;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "jwt.secret=test-secret-key-for-ci-only",
    "jwt.expiration=3600000"   // 1시간(밀리초) 예시값
})
class ShoppingmallCocoApplicationTests {

    @Test
    void contextLoads() {
    }

}
