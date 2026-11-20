
package com.citamedicas.sistemacitasmedicasweb.config;

import com.citamedicas.sistemacitasmedicasweb.modelo.Usuario;
import com.citamedicas.sistemacitasmedicasweb.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/** Crea un administrador inicial solo cuando se configuran variables de entorno explícitas. */
@Component
public class BootstrapAdminInitializer implements ApplicationRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${citamed.bootstrap.username:}")
    private String bootstrapUsername;

    @Value("${citamed.bootstrap.password:}")
    private String bootstrapPassword;

    public BootstrapAdminInitializer(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!StringUtils.hasText(bootstrapUsername)
                || !StringUtils.hasText(bootstrapPassword)) {
            return;
        }

        String username = bootstrapUsername.trim();

        if (usuarioRepository.existsByUsuario(username)) {
            return;
        }

        Usuario admin = new Usuario(
                username,
                passwordEncoder.encode(bootstrapPassword)
        );

        admin.setRol("ADMIN");
        usuarioRepository.save(admin);
    }
}
