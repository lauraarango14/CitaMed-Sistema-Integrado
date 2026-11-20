
package com.citamedicas.sistemacitasmedicasweb;

import com.citamedicas.sistemacitasmedicasweb.modelo.Usuario;
import com.citamedicas.sistemacitasmedicasweb.repository.UsuarioRepository;
import com.citamedicas.sistemacitasmedicasweb.servicio.AuthService;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    private AuthService authService;
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void configurar() {
        passwordEncoder = new BCryptPasswordEncoder();
        authService = new AuthService(usuarioRepository, passwordEncoder);
    }

    // PRUEBAS DEL MÉTODO REGISTRAR

    @Test
    void registrarDebeRechazarUsuarioVacio() {

        assertThrows(IllegalArgumentException.class,
                () -> authService.registrar("", "Clave1234"));

        verifyNoInteractions(usuarioRepository);
    }

    @Test
    void registrarDebeRechazarContrasenaVacia() {

        assertThrows(IllegalArgumentException.class,
                () -> authService.registrar("usuario", ""));

        verifyNoInteractions(usuarioRepository);
    }

    @Test
    void registrarDebeRechazarContrasenaCorta() {

        assertThrows(IllegalArgumentException.class,
                () -> authService.registrar("usuario", "1234567"));

        verifyNoInteractions(usuarioRepository);
    }

    @Test
    void registrarDebeRechazarUsuarioExistente() {

        when(usuarioRepository.existsByUsuario("usuario"))
                .thenReturn(true);

        assertThrows(IllegalArgumentException.class,
                () -> authService.registrar("usuario", "Clave1234"));

        verify(usuarioRepository).existsByUsuario("usuario");
        verify(usuarioRepository, never()).save(any(Usuario.class));
    }

    @Test
    void registrarDebeGuardarUsuarioConRolUserYContrasenaCifrada() {

        when(usuarioRepository.existsByUsuario("usuario"))
                .thenReturn(false);

        String resultado =
                authService.registrar(" usuario ", "Clave1234");

        ArgumentCaptor<Usuario> captor =
                ArgumentCaptor.forClass(Usuario.class);

        verify(usuarioRepository).save(captor.capture());

        Usuario usuarioGuardado = captor.getValue();

        assertEquals("Usuario registrado correctamente.", resultado);
        assertEquals("usuario", usuarioGuardado.getUsuario());
        assertEquals("USER", usuarioGuardado.getRol());

        assertNotEquals("Clave1234", usuarioGuardado.getContrasena());

        assertTrue(passwordEncoder.matches(
                "Clave1234",
                usuarioGuardado.getContrasena()));
    }

    // PRUEBAS DEL MÉTODO AUTENTICAR

    @Test
    void autenticarDebeRechazarDatosVacios() {

        assertThrows(IllegalArgumentException.class,
                () -> authService.autenticar("", ""));

        verifyNoInteractions(usuarioRepository);
    }

    @Test
    void autenticarDebeRechazarUsuarioInexistente() {

        when(usuarioRepository.findByUsuario("desconocido"))
                .thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class,
                () -> authService.autenticar("desconocido", "Clave1234"));

        verify(usuarioRepository).findByUsuario("desconocido");
    }

    @Test
    void autenticarDebeRechazarContrasenaIncorrecta() {

        String contrasenaCifrada =
                passwordEncoder.encode("ClaveCorrecta");

        Usuario usuario = new Usuario(
                "usuario",
                contrasenaCifrada
        );

        when(usuarioRepository.findByUsuario("usuario"))
                .thenReturn(Optional.of(usuario));

        assertThrows(IllegalArgumentException.class,
                () -> authService.autenticar("usuario", "ClaveIncorrecta"));
    }

    @Test
    void autenticarDebeAceptarCredencialesCorrectas() {

        String contrasenaCifrada =
                passwordEncoder.encode("Clave1234");

        Usuario usuario = new Usuario(
                "usuario",
                contrasenaCifrada
        );

        when(usuarioRepository.findByUsuario("usuario"))
                .thenReturn(Optional.of(usuario));

        String resultado =
                authService.autenticar("usuario", "Clave1234");

        assertEquals("Autenticación satisfactoria.", resultado);

        verify(usuarioRepository).findByUsuario("usuario");
    }
}
