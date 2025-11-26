package com.shoppingmallcoco.project.repository.order;

import com.shoppingmallcoco.project.entity.order.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findAllByMemberMemNoOrderByOrderNoDesc(Long memNo);

}
