package com.shoppingmallcoco.project.config;

import com.siot.IamportRestClient.IamportClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class IamportConfig {
    // 포트원 테스트용 키
    private String apiKey = "imp_apikey"; 
    private String apiSecret = "ekdltm4735"; 

    @Bean
    public IamportClient iamportClient() {
        return new IamportClient(apiKey, apiSecret);
    }
}