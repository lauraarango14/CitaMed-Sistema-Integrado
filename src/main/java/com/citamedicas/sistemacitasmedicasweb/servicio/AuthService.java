
package com.citamedicas.sistemacitasmedicasweb.servicio;

import com.citamedicas.sistemacitasmedicasweb.modelo.Usuario;
import com.citamedicas.sistemacitasmedicasweb.repository.UsuarioRepository;
import java.util.Optional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Servicio encargado del registro y autenticación de usuarios.
 * Las contraseñas se almacenan protegidas mediante BCrypt.
 */
@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    // Inyección de dependencias del repositorio y BCrypt.
    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Registra un usuario nuevo después de validar sus datos.
     */
    public String registrar(String nombreUsuario, String contrasena) {

        if (nombreUsuario == null || nombreUsuario.isBlank()
                || contrasena == null || contrasena.isBlank()) {
            throw new IllegalArgumentException(
                    "El usuario y la contraseña son obligatorios.");
        }
        if (contrasena.length() < 8) {
            throw new IllegalArgumentException(
                    "La contraseña debe tener al menos 8 caracteres.");
        }

        nombreUsuario = nombreUsuario.trim();

        if (usuarioRepository.existsByUsuario(nombreUsuario)) {
            throw new IllegalArgumentException(
                    "El nombre de usuario ya está registrado.");
        }

        // Se cifra la contraseña antes de guardarla.
        String contrasenaEncriptada =
                passwordEncoder.encode(contrasena);

        Usuario nuevoUsuario =
                new Usuario(nombreUsuario, contrasenaEncriptada);
        nuevoUsuario.setRol("USER");

        usuarioRepository.save(nuevoUsuario);

        return "Usuario registrado correctamente.";
    }

    /**
     * Comprueba si el usuario y la contraseña son correctos.
     */
    public String autenticar(String nombreUsuario, String contrasena) {

        if (nombreUsuario == null || nombreUsuario.isBlank()
                || contrasena == null || contrasena.isBlank()) {
            throw new IllegalArgumentException("Error en la autenticación.");
        }

        Optional<Usuario> usuarioEncontrado =
                usuarioRepository.findByUsuario(nombreUsuario.trim());

        if (usuarioEncontrado.isEmpty()
                || contrasena == null
                || !passwordEncoder.matches(
                        contrasena,
                        usuarioEncontrado.get().getContrasena())) {

            throw new IllegalArgumentException(
                    "Error en la autenticación.");
        }

        return "Autenticación satisfactoria.";
    }
}
