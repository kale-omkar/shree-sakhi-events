-- =============================================================================
-- Shree Sakhi Events — Stalls Seed Data (December 2026 Exhibition)
-- Source: SHREE_SAKHI_DEC_2026.pdf floor plan (image reviewed — categories read
--         from colour legend).
-- Legend: Brown=PREMIUM ₹5000, Yellow=REGULAR ₹4000, Green=CLASSIC ₹4000,
--         Blue=SINGLE_TABLE ₹2500.
-- Non-selectable facility blocks (drawn separately on map, NOT stalls):
--   ENTRY, EXIT, STAIR, ORG, STAGE.
-- =============================================================================

USE `sakhi_events_db`;

SET @event_id = 3; -- Shree Sakhi Grand Diwali & Wedding Lifestyle Expo 2026

-- Stall type prices: PREMIUM 5000, REGULAR 4000, CLASSIC 4000, SINGLE_TABLE 2500
-- size_label read from image where legible; otherwise "Pending".
-- Grid positions (posx,posy,width,height) are approximate layout placeholders.

-- PREMIUM (brown) — ₹5000
INSERT INTO `stalls` (`event_id`,`stall_code`,`stall_type`,`size_label`,`price`,`posx`,`posy`,`width`,`height`,`is_active`) VALUES
(@event_id,'1','PREMIUM','11x6',5000.00,5,3,1,2,TRUE),
(@event_id,'7','PREMIUM','10x7',5000.00,4,6,1,1,TRUE),
(@event_id,'11','PREMIUM','10x7',5000.00,4,1,1,1,TRUE),
(@event_id,'12','PREMIUM','12x7',5000.00,3,1,1,1,TRUE),
(@event_id,'16','PREMIUM','10x7',5000.00,4,5,1,1,TRUE),
(@event_id,'17','PREMIUM','10x7',5000.00,3,7,1,1,TRUE),
(@event_id,'23','PREMIUM','10x7',5000.00,2,2,1,1,TRUE),
(@event_id,'24','PREMIUM','10x7',5000.00,2,1,1,1,TRUE),
(@event_id,'35','PREMIUM','Pending',5000.00,1,2,1,1,TRUE),
(@event_id,'36','PREMIUM','Pending',5000.00,1,1,1,1,TRUE),
(@event_id,'37','PREMIUM','Pending',5000.00,2,1,1,1,TRUE),
(@event_id,'40','PREMIUM','Pending',5000.00,5,1,1,1,TRUE),
(@event_id,'41','PREMIUM','10x7',5000.00,6,1,1,1,TRUE)
ON DUPLICATE KEY UPDATE `stall_code`=`stall_code`;

-- CLASSIC (green) — ₹4000
INSERT INTO `stalls` (`event_id`,`stall_code`,`stall_type`,`size_label`,`price`,`posx`,`posy`,`width`,`height`,`is_active`) VALUES
(@event_id,'2','CLASSIC','11x4',4000.00,5,4,1,1,TRUE),
(@event_id,'3','CLASSIC','11x4',4000.00,5,5,1,1,TRUE),
(@event_id,'4','CLASSIC','11x4',4000.00,5,6,1,1,TRUE),
(@event_id,'5','CLASSIC','11x4',4000.00,5,7,1,1,TRUE)
ON DUPLICATE KEY UPDATE `stall_code`=`stall_code`;

-- SINGLE_TABLE (blue) — ₹2500 — units A to H
INSERT INTO `stalls` (`event_id`,`stall_code`,`stall_type`,`size_label`,`price`,`posx`,`posy`,`width`,`height`,`is_active`) VALUES
(@event_id,'A','SINGLE_TABLE','7x4',2500.00,7,7,1,1,TRUE),
(@event_id,'B','SINGLE_TABLE','7x4',2500.00,7,6,1,1,TRUE),
(@event_id,'C','SINGLE_TABLE','7x4',2500.00,7,5,1,1,TRUE),
(@event_id,'D','SINGLE_TABLE','7x4',2500.00,7,4,1,1,TRUE),
(@event_id,'E','SINGLE_TABLE','7x4',2500.00,7,3,1,1,TRUE),
(@event_id,'F','SINGLE_TABLE','7x4',2500.00,7,3,1,1,TRUE),
(@event_id,'G','SINGLE_TABLE','7x4',2500.00,7,2,1,1,TRUE),
(@event_id,'H','SINGLE_TABLE','7x4',2500.00,7,1,1,1,TRUE)
ON DUPLICATE KEY UPDATE `stall_code`=`stall_code`;

-- REGULAR (yellow) — ₹4000
INSERT INTO `stalls` (`event_id`,`stall_code`,`stall_type`,`size_label`,`price`,`posx`,`posy`,`width`,`height`,`is_active`) VALUES
(@event_id,'8','REGULAR','9x7',4000.00,4,4,1,1,TRUE),
(@event_id,'9','REGULAR','9x7',4000.00,3,4,1,1,TRUE),
(@event_id,'10','REGULAR','9x7',4000.00,3,2,1,1,TRUE),
(@event_id,'13','REGULAR','9x7',4000.00,3,3,1,1,TRUE),
(@event_id,'14','REGULAR','9x7',4000.00,3,4,1,1,TRUE),
(@event_id,'15','REGULAR','9x7',4000.00,3,5,1,1,TRUE),
(@event_id,'18','REGULAR','9x7',4000.00,2,7,1,1,TRUE),
(@event_id,'19','REGULAR','9x7',4000.00,2,6,1,1,TRUE),
(@event_id,'20','REGULAR','9x7',4000.00,2,5,1,1,TRUE),
(@event_id,'21','REGULAR','9x7',4000.00,2,4,1,1,TRUE),
(@event_id,'22','REGULAR','9x7',4000.00,2,3,1,1,TRUE),
(@event_id,'25','REGULAR','9x7',4000.00,2,2,1,1,TRUE),
(@event_id,'26','REGULAR','9x7',4000.00,2,5,1,1,TRUE),
(@event_id,'27','REGULAR','9x7',4000.00,2,6,1,1,TRUE),
(@event_id,'28','REGULAR','9x7',4000.00,2,7,1,1,TRUE),
(@event_id,'29','REGULAR','9x7',4000.00,2,8,1,1,TRUE),
(@event_id,'30','REGULAR','9x7',4000.00,1,8,1,1,TRUE),
(@event_id,'31','REGULAR','9x7',4000.00,1,7,1,1,TRUE),
(@event_id,'32','REGULAR','9x7',4000.00,1,6,1,1,TRUE),
(@event_id,'33','REGULAR','9x7',4000.00,1,5,1,1,TRUE),
(@event_id,'34','REGULAR','9x7',4000.00,1,4,1,1,TRUE),
(@event_id,'38','REGULAR','Pending',4000.00,3,1,1,1,TRUE),
(@event_id,'39','REGULAR','Pending',4000.00,4,1,1,1,TRUE)
ON DUPLICATE KEY UPDATE `stall_code`=`stall_code`;

-- Stall 6: not clearly legible on the floor plan — pending client confirmation
INSERT INTO `stalls` (`event_id`,`stall_code`,`stall_type`,`size_label`,`price`,`posx`,`posy`,`width`,`height`,`is_active`) VALUES
(@event_id,'6','PREMIUM','Pending',5000.00,3,7,1,1,TRUE)
ON DUPLICATE KEY UPDATE `stall_code`=`stall_code`;
