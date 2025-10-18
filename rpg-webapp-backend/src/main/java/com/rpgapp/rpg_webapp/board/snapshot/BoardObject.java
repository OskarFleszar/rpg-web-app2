
package com.rpgapp.rpg_webapp.board.snapshot;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.Getter; import lombok.Setter; import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")   // kluczowe!
@JsonSubTypes({
        @JsonSubTypes.Type(value = StrokeObject.class, name = "stroke"),
        @JsonSubTypes.Type(value = ShapeObject.class,  name = "shape")
})
public abstract class BoardObject {
    private String type;          // "stroke" | "shape"  (musi być w JSON)
    private String objectId;      // UUID w stringu
    private Long ownerId;
    private LocalDateTime createdAt;
}
