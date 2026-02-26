package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration //it tells spring boot - whenever the application starts - read this class immediately
public class CorsConfig {

    @Bean //this tells spring - execute this method and keep the result in your memory, the result become the bean that spring manages and applies to the whole app
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) { //we are overiding the default CORS Mapping method, the registry is like a guest like we are about to write names on the guest list
                registry.addMapping("/**") //apply to all endpoints
                        .allowedOrigins(
                                "http://localhost:5173",
                                "https://momentum-eosin.vercel.app") //vercel url
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH") //ALLOW ALL ACTIONS
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}
