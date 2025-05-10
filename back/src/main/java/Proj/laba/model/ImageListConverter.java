package Proj.laba.model;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Converter
public class ImageListConverter implements AttributeConverter<List<byte[]>, String> {

    private static final Logger logger = LoggerFactory.getLogger(ImageListConverter.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<byte[]> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return "[]";
        }
        try {
            // Преобразуем каждый массив байтов в Base64-строку
            List<String> base64Images = attribute.stream()
                    .map(Base64.getEncoder()::encodeToString)
                    .collect(Collectors.toList());
            // Преобразуем список строк в JSON
            return objectMapper.writeValueAsString(base64Images);
        } catch (JsonProcessingException e) {
            logger.error("Ошибка при преобразовании списка изображений в JSON", e);
            return "[]";
        }
    }

    @Override
    public List<byte[]> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.equals("[]")) {
            return new ArrayList<>();
        }
        try {
            // Преобразуем JSON в список строк
            List<String> base64Images = objectMapper.readValue(dbData, new TypeReference<List<String>>() {});
            // Преобразуем каждую Base64-строку обратно в массив байтов
            return base64Images.stream()
                    .map(base64 -> Base64.getDecoder().decode(base64))
                    .collect(Collectors.toList());
        } catch (IOException e) {
            logger.error("Ошибка при преобразовании JSON в список изображений", e);
            return new ArrayList<>();
        }
    }
}
