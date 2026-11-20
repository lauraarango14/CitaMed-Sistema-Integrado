
package com.citamedicas.sistemacitasmedicasweb.servicio;

import com.citamedicas.sistemacitasmedicasweb.modelo.Usuario;
import com.citamedicas.sistemacitasmedicasweb.repository.UsuarioRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/** Carga las cuentas existentes desde MySQL para Spring Security. */
@Service
public class UsuarioDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String nombreUsuario)
            throws UsernameNotFoundException {

        Usuario usuario = usuarioRepository.findByUsuario(nombreUsuario.trim())
                .orElseThrow(() ->
                        new UsernameNotFoundException("Credenciales inválidas."));

        // Las cuentas antiguas sin rol se consideran usuarios normales.
        String rol = usuario.getRol();

        if (rol == null || rol.isBlank()) {
            rol = "USER";
        }

        if (rol.startsWith("ROLE_")) {
            rol = rol.substring(5);
        }

        return User.withUsername(usuario.getUsuario())
                .password(usuario.getContrasena())
                .roles(rol)
                .build();
    }
}
