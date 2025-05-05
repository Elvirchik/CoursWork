package Proj.laba.controller.rest;

import Proj.laba.dto.ServicesDTO;
import Proj.laba.mapper.ServicesMapper;
import Proj.laba.model.Services;
import Proj.laba.service.ServicesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/services")
@Tag(name = "Услуги", description = "Контроллер для работы с услугами компании")
public class ServiceController extends GenericController<Services, ServicesDTO> {

    private final ServicesService servicesService;
    private final ServicesMapper servicesMapper;

    public ServiceController(ServicesService serviceService, ServicesMapper servicesMapper) {
        super(serviceService, servicesMapper);
        this.servicesService = serviceService;
        this.servicesMapper = servicesMapper;
    }

    @GetMapping
    @Operation(summary = "Получить список всех активных услуг")
    public ResponseEntity<List<ServicesDTO>> getAllServices() {
        List<ServicesDTO> servicesDTOs = servicesService.listAll();
        return ResponseEntity.ok(servicesDTOs);
    }

    @DeleteMapping("/soft/{id}")
    @Operation(summary = "Мягкое удаление услуги")
    public ResponseEntity<Void> softDelete(@PathVariable Long id) {
        servicesService.softDelete(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
