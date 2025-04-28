package Proj.laba.mapper;

import Proj.laba.dto.ServicesDTO;
import Proj.laba.model.Services;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class ServicesMapper extends GenericMapper<Services, ServicesDTO> {

    public ServicesMapper(ModelMapper modelMapper) {
        super(Services.class, ServicesDTO.class, modelMapper);
    }

    @Override
    protected void mapSpecificFields(ServicesDTO source, Services destination) {
        // Специфическое мапирование, если необходимо
    }

    @Override
    protected void mapSpecificFields(Services source, ServicesDTO destination) {
        // Специфическое мапирование, если необходимо
    }

    @Override
    protected void setupMapper() {
        // Настройка специфического мапирования, если необходимо
    }

    @Override
    protected List<Long> getIds(Services entity) {
        return Collections.singletonList(entity.getId());
    }
}
