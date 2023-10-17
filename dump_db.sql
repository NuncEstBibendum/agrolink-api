-- MySQL dump 10.13  Distrib 8.0.28, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: agrolink
-- ------------------------------------------------------
-- Server version	8.0.28

USE agrolink;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Conversation`
--

DROP TABLE IF EXISTS `Conversation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Conversation` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `authorId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Conversation`
--

LOCK TABLES `Conversation` WRITE;
/*!40000 ALTER TABLE `Conversation` DISABLE KEYS */;
INSERT INTO `Conversation` VALUES ('064f155f-0f2d-44a1-b01c-6ee1579c4acc','2023-10-16 09:59:46.282','2023-10-16 09:59:46.282','Test titre','4a9fdc24-bc7c-49f5-9af6-050d801d2201'),('4dee1499-6466-412d-83d3-9470452718f6','2023-10-17 11:04:29.910','2023-10-17 11:04:29.910','Colza bien développé','4a9fdc24-bc7c-49f5-9af6-050d801d2201');
/*!40000 ALTER TABLE `Conversation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Message`
--

DROP TABLE IF EXISTS `Message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Message` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `text` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hasAnswer` tinyint(1) NOT NULL DEFAULT '0',
  `isLiked` tinyint(1) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `conversationId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Message_userId_fkey` (`userId`),
  KEY `Message_conversationId_fkey` (`conversationId`),
  CONSTRAINT `Message_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `Conversation` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Message_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Message`
--

LOCK TABLES `Message` WRITE;
/*!40000 ALTER TABLE `Message` DISABLE KEYS */;
INSERT INTO `Message` VALUES ('0726f914-6032-4c44-9179-4802fd7d41bd','Une autre question encore une fois, parce que je ne sais pas vraiment ce que je dois chercher. Pouvez vous m’aider ? ',1,NULL,'2023-10-17 10:23:17.368','2023-10-17 11:35:02.483','4a9fdc24-bc7c-49f5-9af6-050d801d2201','064f155f-0f2d-44a1-b01c-6ee1579c4acc'),('274e5ba7-b3fe-4755-a57b-1a2895fc7c34','Ok merci pour les informations !',1,NULL,'2023-10-17 06:50:02.949','2023-10-17 11:35:02.483','4a9fdc24-bc7c-49f5-9af6-050d801d2201','064f155f-0f2d-44a1-b01c-6ee1579c4acc'),('34c85b39-1c9f-4117-a68b-a5e4abdb3882','Une autre question',1,NULL,'2023-10-17 07:17:28.041','2023-10-17 11:35:02.483','4a9fdc24-bc7c-49f5-9af6-050d801d2201','064f155f-0f2d-44a1-b01c-6ee1579c4acc'),('4c7fe4b5-ea03-4df0-9319-3df6acc25941','J’ai répondu ',1,NULL,'2023-10-17 12:00:53.578','2023-10-17 12:00:53.578','e7bf721a-adc2-49f8-8456-2857c2f1b294','4dee1499-6466-412d-83d3-9470452718f6'),('5a182db0-d4b7-4736-90ff-3f596efb512c','Ffsshdjdj',1,0,'2023-10-16 15:49:34.291','2023-10-17 18:49:36.634','e7bf721a-adc2-49f8-8456-2857c2f1b294','064f155f-0f2d-44a1-b01c-6ee1579c4acc'),('60bd2f6e-7696-40db-bed3-e91a22685e9e','Test de réponse ',1,1,'2023-10-16 15:43:39.741','2023-10-17 18:49:35.294','e7bf721a-adc2-49f8-8456-2857c2f1b294','064f155f-0f2d-44a1-b01c-6ee1579c4acc'),('63f394bf-ecb3-4986-8c82-1f8327e8edd5','Je pensais le réguler avec une demi dose Sunorg, stade 6-10F. Est ce utile ?',1,NULL,'2023-10-17 11:04:29.934','2023-10-17 12:00:53.564','4a9fdc24-bc7c-49f5-9af6-050d801d2201','4dee1499-6466-412d-83d3-9470452718f6'),('685e14c5-fcac-4506-993a-c9418d07ee64','Encore une autre réponse ',1,NULL,'2023-10-16 15:45:28.029','2023-10-17 11:35:02.483','e7bf721a-adc2-49f8-8456-2857c2f1b294','064f155f-0f2d-44a1-b01c-6ee1579c4acc'),('72b6debe-4350-47ad-b47e-c12ba7367f79','Et voilà que les précédentes ',1,NULL,'2023-10-16 15:47:07.247','2023-10-17 11:35:02.483','e7bf721a-adc2-49f8-8456-2857c2f1b294','064f155f-0f2d-44a1-b01c-6ee1579c4acc'),('802f7246-fba9-4d28-b952-db273aaa4a0c','Et voilà une autre réponse ',1,NULL,'2023-10-17 07:16:47.028','2023-10-17 11:35:02.483','e7bf721a-adc2-49f8-8456-2857c2f1b294','064f155f-0f2d-44a1-b01c-6ee1579c4acc'),('84394db0-4c03-47bf-b401-f60a97ae45e8','Dggdgugh',0,NULL,'2023-10-17 11:35:02.506','2023-10-17 11:35:02.506','4a9fdc24-bc7c-49f5-9af6-050d801d2201','064f155f-0f2d-44a1-b01c-6ee1579c4acc'),('9332acdd-8c62-4234-8748-1c9c87163e0b','Et voilà une réponse qui est beaucoup plus longue que les précédentes ',1,NULL,'2023-10-16 15:46:28.082','2023-10-17 11:35:02.483','e7bf721a-adc2-49f8-8456-2857c2f1b294','064f155f-0f2d-44a1-b01c-6ee1579c4acc'),('94c73669-98bc-41f2-a67e-3ebe607994d1','Une réponse ',1,1,'2023-10-17 11:03:01.265','2023-10-17 13:56:44.243','e7bf721a-adc2-49f8-8456-2857c2f1b294','064f155f-0f2d-44a1-b01c-6ee1579c4acc'),('b4c8c0ca-901b-40e6-9a01-594b8f0e4c26','Ndndnd dej Die djsbsbd dndjdbd ',1,NULL,'2023-10-16 09:59:46.296','2023-10-17 11:35:02.483','4a9fdc24-bc7c-49f5-9af6-050d801d2201','064f155f-0f2d-44a1-b01c-6ee1579c4acc'),('b693778b-8603-448a-9924-f398208f66e1','Encore une réponse ',1,0,'2023-10-17 07:57:03.160','2023-10-17 11:56:05.492','e7bf721a-adc2-49f8-8456-2857c2f1b294','064f155f-0f2d-44a1-b01c-6ee1579c4acc'),('f51e2066-bad5-43cb-b1d0-944787825689','Jdjd Jdjd djjdjd disons sj',1,NULL,'2023-10-16 15:51:34.590','2023-10-17 11:35:02.483','e7bf721a-adc2-49f8-8456-2857c2f1b294','064f155f-0f2d-44a1-b01c-6ee1579c4acc');
/*!40000 ALTER TABLE `Message` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Tag`
--

DROP TABLE IF EXISTS `Tag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Tag` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` enum('ACS','VEGETAL_COVER','SOIL_PROTECTION','SOIL_ANALYSIS','CROP_PROTECTION','FERTILIZATION','TRAINING') COLLATE utf8mb4_unicode_ci NOT NULL,
  `color` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Tag`
--

LOCK TABLES `Tag` WRITE;
/*!40000 ALTER TABLE `Tag` DISABLE KEYS */;
INSERT INTO `Tag` VALUES ('197cf822-3867-43a1-a75f-3e7625832130','TRAINING','#fdf7d0','2023-10-16 11:39:16.528','2023-10-16 11:39:16.528'),('1eb2242d-497b-44d0-b745-6b810d7baea9','SOIL_PROTECTION','#ff1e00','2023-10-16 11:39:16.516','2023-10-16 11:39:16.516'),('51b054d8-a7e0-49f8-84d3-63dad298a668','VEGETAL_COVER','#95f5b9','2023-10-16 09:58:41.971','2023-10-16 09:58:41.971'),('5dddaa7b-5f32-4a98-9a98-2d63561f2b40','FERTILIZATION','#e1f0ff','2023-10-16 11:39:16.527','2023-10-16 11:39:16.527'),('7120036b-c7fe-49f9-b90f-883defa003b9','SOIL_ANALYSIS','#aef7d9','2023-10-16 11:39:16.524','2023-10-16 11:39:16.524'),('aaf7e844-8435-4d1e-a083-6023a20785cd','ACS','#fdeffe','2023-10-16 09:57:42.671','2023-10-16 09:57:42.671'),('d57644c8-ecdc-43fb-b119-c393512f0452','CROP_PROTECTION','#07a740','2023-10-16 11:39:16.526','2023-10-16 11:39:16.526');
/*!40000 ALTER TABLE `Tag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `User` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `profession` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `temporaryPassword` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `temporaryPasswordExpiry` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES ('4a9fdc24-bc7c-49f5-9af6-050d801d2201','julien.gg@hotmail.fr','$2a$10$YwWBMnfBA/edn.o6QQPUi.P9vBt3xoJkxDkb/Yd5Mfk75t1Efff0C','Julien Agri','farmer','2023-10-16 08:04:28.398','2023-10-17 13:56:27.963',NULL,NULL),('e7bf721a-adc2-49f8-8456-2857c2f1b294','Test1@test.fr','$2a$10$WFxlpjn5mxC1ecviUFO66e0S3x4RXhda9L5hFEzKkL69LdFeSG0eK','Julien','agronomist','2023-10-15 20:26:25.324','2023-10-17 07:55:25.020',NULL,NULL);
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `_ConversationToTag`
--

DROP TABLE IF EXISTS `_ConversationToTag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_ConversationToTag` (
  `A` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `B` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  UNIQUE KEY `_ConversationToTag_AB_unique` (`A`,`B`),
  KEY `_ConversationToTag_B_index` (`B`),
  CONSTRAINT `_ConversationToTag_A_fkey` FOREIGN KEY (`A`) REFERENCES `Conversation` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `_ConversationToTag_B_fkey` FOREIGN KEY (`B`) REFERENCES `Tag` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_ConversationToTag`
--

LOCK TABLES `_ConversationToTag` WRITE;
/*!40000 ALTER TABLE `_ConversationToTag` DISABLE KEYS */;
INSERT INTO `_ConversationToTag` VALUES ('064f155f-0f2d-44a1-b01c-6ee1579c4acc','51b054d8-a7e0-49f8-84d3-63dad298a668'),('4dee1499-6466-412d-83d3-9470452718f6','5dddaa7b-5f32-4a98-9a98-2d63561f2b40'),('064f155f-0f2d-44a1-b01c-6ee1579c4acc','aaf7e844-8435-4d1e-a083-6023a20785cd');
/*!40000 ALTER TABLE `_ConversationToTag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `_UserToConversation`
--

DROP TABLE IF EXISTS `_UserToConversation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_UserToConversation` (
  `A` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `B` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  UNIQUE KEY `_UserToConversation_AB_unique` (`A`,`B`),
  KEY `_UserToConversation_B_index` (`B`),
  CONSTRAINT `_UserToConversation_A_fkey` FOREIGN KEY (`A`) REFERENCES `Conversation` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `_UserToConversation_B_fkey` FOREIGN KEY (`B`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_UserToConversation`
--

LOCK TABLES `_UserToConversation` WRITE;
/*!40000 ALTER TABLE `_UserToConversation` DISABLE KEYS */;
INSERT INTO `_UserToConversation` VALUES ('064f155f-0f2d-44a1-b01c-6ee1579c4acc','4a9fdc24-bc7c-49f5-9af6-050d801d2201'),('4dee1499-6466-412d-83d3-9470452718f6','4a9fdc24-bc7c-49f5-9af6-050d801d2201');
/*!40000 ALTER TABLE `_UserToConversation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('6b50969f-5a67-415a-83ad-2749ea3c4e8d','ee9a6c5c5a3a266af64e14937b32b58ee47c6562a49b00e541b567a683053af0','2023-10-16 08:16:24.903','20231016081624_conversations_message',NULL,NULL,'2023-10-16 08:16:24.576',1),('712d88e7-4d9e-4a6f-8211-bd612b66e0cc','ea1f57b1064a2bbad59cee103d25ba0546f50d8461ce6fab2371e3e957c055f3','2023-10-16 09:26:55.788','20231016092655_ondelete_cascade',NULL,NULL,'2023-10-16 09:26:55.592',1),('aa9e241f-0610-4c97-bfeb-417efbedb582','5b52bdd5f751acc6a43bcfcb00255f27f80e17c0e0bd887647ed54625eb8eeee','2023-10-17 12:14:41.767','20231017121441_temporary_password',NULL,NULL,'2023-10-17 12:14:41.617',1),('c8320ef5-0879-443f-85b7-d3fc7890ca97','7d990a1afc5936dbf7ad7aacbf2b614b8951f0bdb35db49c65d6f997d26ea517','2023-10-15 18:40:12.622','20231015184012_database_init',NULL,NULL,'2023-10-15 18:40:12.344',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-10-17 21:47:37
