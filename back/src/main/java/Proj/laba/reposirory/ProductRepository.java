package Proj.laba.reposirory;

import Proj.laba.model.Product;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ProductRepository extends GenericRepository<Product> {

    // Метод для мягкого удаления товара
    @Modifying
    @Transactional
    @Query("UPDATE Product p SET p.isDeleted = true WHERE p.id = :id")
    void softDelete(@Param("id") Long id);

    // Метод для получения только не удаленных товаров
    @Query("SELECT p FROM Product p WHERE p.isDeleted = false")
    List<Product> findAllActive();
}
