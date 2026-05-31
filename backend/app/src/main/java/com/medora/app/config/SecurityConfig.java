package com.medora.app.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final UserDetailsService userDetailsService;

    private final JWTFilter jwtFilter;

    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(UserDetailsService userDetailsService, JWTFilter jwtFilter, CorsConfigurationSource corsConfigurationSource) {
        this.userDetailsService = userDetailsService;
        this.jwtFilter = jwtFilter;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public BCryptPasswordEncoder pwdEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authProvider() {
        DaoAuthenticationProvider authProvider= new DaoAuthenticationProvider();
        authProvider.setPasswordEncoder(pwdEncoder());
        authProvider.setUserDetailsService(userDetailsService);
        return authProvider;
    }

    @Bean
    public AuthenticationManager authManager(AuthenticationConfiguration config) throws Exception{
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain security(HttpSecurity http) throws Exception{
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .authorizeHttpRequests((req) ->{ req
                        .requestMatchers("/", "/api/register","/api/login", "/api/hospitals").permitAll()
                        .requestMatchers("/api/admin/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/hospital/**").hasAuthority("HOSPITAL")
                        .requestMatchers("/api/doctor/**").hasAuthority("DOCTOR")
                        .requestMatchers("/api/patient/**").hasAuthority("PATIENT")
                        .anyRequest()
                        .authenticated();
                })
//                .exceptionHandling(ex -> ex
//                    .authenticationEntryPoint((request, response, authException) -> {
//                        response.setStatus(401);
//                        response.setContentType("application/json");
//                        response.getWriter().write("{\"message\":\"Unauthorized - Please login again\"}");
//                    })
//                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .headers(Customizer -> Customizer.frameOptions(frameCustomizer -> frameCustomizer.disable()))
                .csrf(Customizer -> Customizer.disable());
        return http.build();
    }
}
