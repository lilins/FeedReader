-- MySQL dump 10.13  Distrib 5.7.17, for macos10.12 (x86_64)
--
-- Host: localhost    Database: rssReader
-- ------------------------------------------------------
-- Server version	5.7.17

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categories` (
  `categoriesId` varchar(32) NOT NULL,
  `name` varchar(25) NOT NULL,
  PRIMARY KEY (`categoriesId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rss2categories`
--

DROP TABLE IF EXISTS `rss2categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rss2categories` (
  `r2cId` varchar(32) NOT NULL,
  `rssId` varchar(32) NOT NULL,
  `categoriesId` varchar(32) NOT NULL,
  PRIMARY KEY (`r2cId`),
  KEY `categoriesId_idx` (`categoriesId`),
  CONSTRAINT `categoriesId` FOREIGN KEY (`categoriesId`) REFERENCES `categories` (`categoriesId`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rssArticle`
--

DROP TABLE IF EXISTS `rssArticle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rssArticle` (
  `rssArticleId` varchar(32) NOT NULL,
  `rssMetaId` varchar(32) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` longtext,
  `summary` longtext,
  `link` varchar(255) DEFAULT NULL,
  `origlink` varchar(255) DEFAULT NULL,
  `permalink` varchar(255) DEFAULT NULL,
  `date` bigint(14) DEFAULT NULL,
  `pubdate` bigint(14) DEFAULT NULL,
  `author` varchar(50) DEFAULT NULL,
  `guid` varchar(255) DEFAULT NULL,
  `comments` varchar(255) DEFAULT NULL,
  `imageTitle` varchar(255) DEFAULT NULL,
  `imageUrl` varchar(255) DEFAULT NULL,
  `source` varchar(255) DEFAULT NULL,
  `enclosures` varchar(255) DEFAULT NULL,
  `meta` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`rssArticleId`),
  KEY `rssMetaId_idx` (`rssMetaId`),
  CONSTRAINT `rssMetaId` FOREIGN KEY (`rssMetaId`) REFERENCES `rssMeta` (`rssMetaId`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rssList`
--

DROP TABLE IF EXISTS `rssList`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rssList` (
  `rssListId` varchar(32) NOT NULL,
  `rssLink` varchar(255) NOT NULL,
  `description` longtext,
  `date` bigint(14) DEFAULT NULL,
  `updateState` int(11) DEFAULT NULL,
  PRIMARY KEY (`rssListId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rssMeta`
--

DROP TABLE IF EXISTS `rssMeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rssMeta` (
  `rssMetaId` varchar(32) NOT NULL,
  `rssListId` varchar(32) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` longtext,
  `link` varchar(255) DEFAULT NULL,
  `xmlurl` varchar(255) DEFAULT NULL,
  `date` bigint(14) DEFAULT NULL,
  `pubdate` bigint(14) DEFAULT NULL,
  `author` varchar(50) DEFAULT NULL,
  `language` varchar(20) DEFAULT NULL,
  `imageTitle` varchar(255) DEFAULT NULL,
  `imageLink` varchar(255) DEFAULT NULL,
  `imageUrl` varchar(255) DEFAULT NULL,
  `favicon` varchar(255) DEFAULT NULL,
  `copyright` varchar(255) DEFAULT NULL,
  `generator` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`rssMetaId`),
  KEY `rssListId_idx` (`rssListId`),
  CONSTRAINT `rssListId` FOREIGN KEY (`rssListId`) REFERENCES `rssList` (`rssListId`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping events for database 'rssReader'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-04-10 13:14:41
