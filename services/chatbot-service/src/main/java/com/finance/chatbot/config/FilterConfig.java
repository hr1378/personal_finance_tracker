package com.finance.chatbot.config;

import com.finance.chatbot.filter.UserContextFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FilterConfig {

    @Bean
    public FilterRegistrationBean<UserContextFilter> userContextFilterRegistration() {
        FilterRegistrationBean<UserContextFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(new UserContextFilter());
        registrationBean.addUrlPatterns("/api/*");
        registrationBean.setOrder(1);
        return registrationBean;
    }
}
