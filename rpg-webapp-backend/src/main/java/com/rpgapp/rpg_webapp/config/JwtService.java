package com.rpgapp.rpg_webapp.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    private static final String SECRET_KEY = "1517c73725cebc63bbc8712a2c9f1bcf80e9845767ee09428dc381e73c8176e3";

    // --- PUBLIC API ---

    public String generateToken(com.rpgapp.rpg_webapp.user.User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", user.getEmail());
        claims.put("role", user.getRole().name());
        claims.put("uid", String.valueOf(user.getId()));
        return buildToken(claims, String.valueOf(user.getId()));
    }


    public String generateToken(UserDetails userDetails) {
        if (userDetails instanceof com.rpgapp.rpg_webapp.user.User u) {
            return generateToken(u);
        }

        return buildToken(new HashMap<>(), userDetails.getUsername());
    }

    public String extractUserId(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractEmail(String token) {
        return extractClaim(token, c -> c.get("email", String.class));
    }

    public boolean isTokenValid(String token) {
        return !isTokenExpired(token);
    }

    // --- INTERNALS ---

    private String buildToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
            .setClaims(claims)
            .setSubject(subject) // = userId
            .setIssuedAt(new Date(System.currentTimeMillis()))
            .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10))
            .signWith(getSignInKey(), SignatureAlgorithm.HS256)
            .compact();
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(getSignInKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
    }

    private Key getSignInKey() {
        byte[] keyBytes = io.jsonwebtoken.io.Decoders.BASE64.decode(SECRET_KEY);
        return io.jsonwebtoken.security.Keys.hmacShaKeyFor(keyBytes);
    }

    // --- ADAPTERY (opcjonalnie na czas migracji, by nie psuć starego kodu) ---
    public String extractUsername(String token) {
        // teraz "username" = email claim (nie subject)
        return extractEmail(token);
    }

    public boolean isTokenValid(String token, UserDetails ignored) {
        return isTokenValid(token);
    }
}
