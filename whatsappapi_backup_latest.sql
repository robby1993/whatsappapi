--
-- PostgreSQL database dump
--

\restrict cK64c6xj9xEgruaredvNYdICGikjfJ6mqH1hbTgNCP8GjRjsmxC95AgJy2lg3rx

-- Dumped from database version 18.6 (Ubuntu 18.6-1.pgdg22.04+2)
-- Dumped by pg_dump version 18.6 (Ubuntu 18.6-1.pgdg22.04+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: enum_Campaigns_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Campaigns_status" AS ENUM (
    'pending',
    'processing',
    'completed'
);


ALTER TYPE public."enum_Campaigns_status" OWNER TO postgres;

--
-- Name: enum_QueuedMessages_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_QueuedMessages_status" AS ENUM (
    'pending',
    'processing',
    'sent',
    'failed'
);


ALTER TYPE public."enum_QueuedMessages_status" OWNER TO postgres;

--
-- Name: enum_ScheduledMessages_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_ScheduledMessages_status" AS ENUM (
    'pending',
    'sent',
    'failed'
);


ALTER TYPE public."enum_ScheduledMessages_status" OWNER TO postgres;

--
-- Name: enum_Users_userType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Users_userType" AS ENUM (
    'admin',
    'user'
);


ALTER TYPE public."enum_Users_userType" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Campaigns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Campaigns" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    sender character varying(255) NOT NULL,
    message text,
    "mediaUrl" character varying(255),
    "mediaType" character varying(255),
    "totalContacts" integer DEFAULT 0,
    "sentCount" integer DEFAULT 0,
    "failedCount" integer DEFAULT 0,
    status public."enum_Campaigns_status" DEFAULT 'pending'::public."enum_Campaigns_status",
    "scheduledAt" timestamp with time zone,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);


ALTER TABLE public."Campaigns" OWNER TO postgres;

--
-- Name: Campaigns_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Campaigns_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Campaigns_id_seq" OWNER TO postgres;

--
-- Name: Campaigns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Campaigns_id_seq" OWNED BY public."Campaigns".id;


--
-- Name: ChatFlows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ChatFlows" (
    id integer NOT NULL,
    "userNumber" character varying(255),
    "botPhone" character varying(255),
    name character varying(255) NOT NULL,
    "triggerKeywords" json NOT NULL,
    steps json NOT NULL,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);


ALTER TABLE public."ChatFlows" OWNER TO postgres;

--
-- Name: ChatFlows_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ChatFlows_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ChatFlows_id_seq" OWNER TO postgres;

--
-- Name: ChatFlows_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ChatFlows_id_seq" OWNED BY public."ChatFlows".id;


--
-- Name: ChatSessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ChatSessions" (
    id integer NOT NULL,
    "senderJid" character varying(255) NOT NULL,
    "botPhone" character varying(255) NOT NULL,
    "currentFlowId" integer,
    "currentStepIndex" integer DEFAULT 0,
    context json,
    "lastInteraction" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."ChatSessions" OWNER TO postgres;

--
-- Name: ChatSessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ChatSessions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ChatSessions_id_seq" OWNER TO postgres;

--
-- Name: ChatSessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ChatSessions_id_seq" OWNED BY public."ChatSessions".id;


--
-- Name: MessageLogs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MessageLogs" (
    id integer NOT NULL,
    sender character varying(255) NOT NULL,
    receiver character varying(255) NOT NULL,
    message text NOT NULL,
    "mediaUrl" character varying(255),
    "mediaType" character varying(255),
    status character varying(255) DEFAULT 'sent'::character varying,
    "messageId" character varying(255),
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    "timestamp" bigint
);


ALTER TABLE public."MessageLogs" OWNER TO postgres;

--
-- Name: MessageLogs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."MessageLogs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."MessageLogs_id_seq" OWNER TO postgres;

--
-- Name: MessageLogs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."MessageLogs_id_seq" OWNED BY public."MessageLogs".id;


--
-- Name: Plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Plans" (
    id integer NOT NULL,
    "planId" character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    days integer NOT NULL,
    price double precision NOT NULL,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);


ALTER TABLE public."Plans" OWNER TO postgres;

--
-- Name: Plans_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Plans_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Plans_id_seq" OWNER TO postgres;

--
-- Name: Plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Plans_id_seq" OWNED BY public."Plans".id;


--
-- Name: QueuedMessages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."QueuedMessages" (
    id integer NOT NULL,
    sender character varying(255) NOT NULL,
    receiver character varying(255) NOT NULL,
    message text NOT NULL,
    "mediaUrl" character varying(255),
    "mediaType" character varying(255),
    status public."enum_QueuedMessages_status" DEFAULT 'pending'::public."enum_QueuedMessages_status",
    "scheduledAt" timestamp with time zone,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);


ALTER TABLE public."QueuedMessages" OWNER TO postgres;

--
-- Name: QueuedMessages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."QueuedMessages_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."QueuedMessages_id_seq" OWNER TO postgres;

--
-- Name: QueuedMessages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."QueuedMessages_id_seq" OWNED BY public."QueuedMessages".id;


--
-- Name: ScheduledMessages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ScheduledMessages" (
    id integer NOT NULL,
    sender character varying(255) NOT NULL,
    receiver character varying(255) NOT NULL,
    message text NOT NULL,
    "mediaUrl" character varying(255),
    "mediaType" character varying(255),
    "scheduleTime" bigint NOT NULL,
    status public."enum_ScheduledMessages_status" DEFAULT 'pending'::public."enum_ScheduledMessages_status",
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);


ALTER TABLE public."ScheduledMessages" OWNER TO postgres;

--
-- Name: ScheduledMessages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ScheduledMessages_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ScheduledMessages_id_seq" OWNER TO postgres;

--
-- Name: ScheduledMessages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ScheduledMessages_id_seq" OWNED BY public."ScheduledMessages".id;


--
-- Name: Sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Sessions" (
    phone character varying(255) NOT NULL,
    "dataType" character varying(255) NOT NULL,
    "dataId" character varying(255) NOT NULL,
    data text
);


ALTER TABLE public."Sessions" OWNER TO postgres;

--
-- Name: Stats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Stats" (
    id integer NOT NULL,
    "totalMessagesSent" integer DEFAULT 0
);


ALTER TABLE public."Stats" OWNER TO postgres;

--
-- Name: Stats_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Stats_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Stats_id_seq" OWNER TO postgres;

--
-- Name: Stats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Stats_id_seq" OWNED BY public."Stats".id;


--
-- Name: SubscriptionHistory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SubscriptionHistory" (
    id integer NOT NULL,
    "userNumber" character varying(255) NOT NULL,
    "userName" character varying(255),
    "planName" character varying(255) NOT NULL,
    days integer NOT NULL,
    price double precision DEFAULT '0'::double precision NOT NULL,
    "paymentMethod" character varying(255) DEFAULT 'Direct'::character varying,
    "startDate" timestamp with time zone,
    "expiryDate" timestamp with time zone,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);


ALTER TABLE public."SubscriptionHistory" OWNER TO postgres;

--
-- Name: SubscriptionHistory_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."SubscriptionHistory_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."SubscriptionHistory_id_seq" OWNER TO postgres;

--
-- Name: SubscriptionHistory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."SubscriptionHistory_id_seq" OWNED BY public."SubscriptionHistory".id;


--
-- Name: Templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Templates" (
    id integer NOT NULL,
    "userNumber" character varying(255),
    keyword character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    content text DEFAULT ''::text,
    buttons json DEFAULT '[]'::json,
    footer character varying(255) DEFAULT ''::character varying,
    header character varying(255) DEFAULT ''::character varying,
    sections json DEFAULT '[]'::json,
    "mediaUrl" character varying(255) DEFAULT ''::character varying,
    "fileName" character varying(255) DEFAULT ''::character varying,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);


ALTER TABLE public."Templates" OWNER TO postgres;

--
-- Name: Templates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Templates_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Templates_id_seq" OWNER TO postgres;

--
-- Name: Templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Templates_id_seq" OWNED BY public."Templates".id;


--
-- Name: Tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Tokens" (
    id integer NOT NULL,
    token character varying(255) NOT NULL,
    number character varying(255) NOT NULL,
    "userType" character varying(255) NOT NULL
);


ALTER TABLE public."Tokens" OWNER TO postgres;

--
-- Name: Tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Tokens_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Tokens_id_seq" OWNER TO postgres;

--
-- Name: Tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Tokens_id_seq" OWNED BY public."Tokens".id;


--
-- Name: Users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Users" (
    id integer NOT NULL,
    number character varying(255) NOT NULL,
    name character varying(255) DEFAULT 'User'::character varying,
    gender character varying(255) DEFAULT 'Not Specified'::character varying,
    password character varying(255) NOT NULL,
    "userType" public."enum_Users_userType" DEFAULT 'user'::public."enum_Users_userType",
    "validDays" integer DEFAULT 3,
    "isActive" boolean DEFAULT true,
    "webhookUrl" character varying(255),
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone,
    "deletedAt" timestamp with time zone
);


ALTER TABLE public."Users" OWNER TO postgres;

--
-- Name: Users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Users_id_seq" OWNER TO postgres;

--
-- Name: Users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Users_id_seq" OWNED BY public."Users".id;


--
-- Name: WabaAutomations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WabaAutomations" (
    id integer NOT NULL,
    "userNumber" character varying(255) NOT NULL,
    "triggerKeyword" character varying(255) NOT NULL,
    "responseType" character varying(255) DEFAULT 'text'::character varying,
    "messageText" text,
    "templateName" character varying(255),
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);


ALTER TABLE public."WabaAutomations" OWNER TO postgres;

--
-- Name: WabaAutomations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."WabaAutomations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."WabaAutomations_id_seq" OWNER TO postgres;

--
-- Name: WabaAutomations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."WabaAutomations_id_seq" OWNED BY public."WabaAutomations".id;


--
-- Name: WabaCampaigns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WabaCampaigns" (
    id integer NOT NULL,
    "userNumber" character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    "templateName" character varying(255) NOT NULL,
    numbers json NOT NULL,
    "scheduledTime" bigint NOT NULL,
    status character varying(255) DEFAULT 'pending'::character varying,
    "sentCount" integer DEFAULT 0,
    "failedCount" integer DEFAULT 0,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);


ALTER TABLE public."WabaCampaigns" OWNER TO postgres;

--
-- Name: WabaCampaigns_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."WabaCampaigns_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."WabaCampaigns_id_seq" OWNER TO postgres;

--
-- Name: WabaCampaigns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."WabaCampaigns_id_seq" OWNED BY public."WabaCampaigns".id;


--
-- Name: WabaDevices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WabaDevices" (
    id integer NOT NULL,
    "userNumber" character varying(255) NOT NULL,
    phone character varying(255) NOT NULL,
    "phoneNumberId" character varying(255) NOT NULL,
    "wabaAccountId" character varying(255) NOT NULL,
    "accessToken" text NOT NULL,
    status character varying(255) DEFAULT 'active'::character varying,
    "qualityRating" character varying(255) DEFAULT 'GREEN'::character varying,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);


ALTER TABLE public."WabaDevices" OWNER TO postgres;

--
-- Name: WabaDevices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."WabaDevices_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."WabaDevices_id_seq" OWNER TO postgres;

--
-- Name: WabaDevices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."WabaDevices_id_seq" OWNED BY public."WabaDevices".id;


--
-- Name: WabaFlows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WabaFlows" (
    id integer NOT NULL,
    "userNumber" character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    "triggerKeyword" character varying(255) NOT NULL,
    "flowData" json NOT NULL,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);


ALTER TABLE public."WabaFlows" OWNER TO postgres;

--
-- Name: WabaFlows_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."WabaFlows_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."WabaFlows_id_seq" OWNER TO postgres;

--
-- Name: WabaFlows_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."WabaFlows_id_seq" OWNED BY public."WabaFlows".id;


--
-- Name: WabaTemplates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WabaTemplates" (
    id integer NOT NULL,
    "userNumber" character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    language character varying(255) DEFAULT 'en_US'::character varying,
    category character varying(255) DEFAULT 'MARKETING'::character varying,
    status character varying(255) DEFAULT 'APPROVED'::character varying,
    components json,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);


ALTER TABLE public."WabaTemplates" OWNER TO postgres;

--
-- Name: WabaTemplates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."WabaTemplates_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."WabaTemplates_id_seq" OWNER TO postgres;

--
-- Name: WabaTemplates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."WabaTemplates_id_seq" OWNED BY public."WabaTemplates".id;


--
-- Name: Campaigns id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Campaigns" ALTER COLUMN id SET DEFAULT nextval('public."Campaigns_id_seq"'::regclass);


--
-- Name: ChatFlows id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatFlows" ALTER COLUMN id SET DEFAULT nextval('public."ChatFlows_id_seq"'::regclass);


--
-- Name: ChatSessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatSessions" ALTER COLUMN id SET DEFAULT nextval('public."ChatSessions_id_seq"'::regclass);


--
-- Name: MessageLogs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MessageLogs" ALTER COLUMN id SET DEFAULT nextval('public."MessageLogs_id_seq"'::regclass);


--
-- Name: Plans id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans" ALTER COLUMN id SET DEFAULT nextval('public."Plans_id_seq"'::regclass);


--
-- Name: QueuedMessages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."QueuedMessages" ALTER COLUMN id SET DEFAULT nextval('public."QueuedMessages_id_seq"'::regclass);


--
-- Name: ScheduledMessages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ScheduledMessages" ALTER COLUMN id SET DEFAULT nextval('public."ScheduledMessages_id_seq"'::regclass);


--
-- Name: Stats id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Stats" ALTER COLUMN id SET DEFAULT nextval('public."Stats_id_seq"'::regclass);


--
-- Name: SubscriptionHistory id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SubscriptionHistory" ALTER COLUMN id SET DEFAULT nextval('public."SubscriptionHistory_id_seq"'::regclass);


--
-- Name: Templates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Templates" ALTER COLUMN id SET DEFAULT nextval('public."Templates_id_seq"'::regclass);


--
-- Name: Tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens" ALTER COLUMN id SET DEFAULT nextval('public."Tokens_id_seq"'::regclass);


--
-- Name: Users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users" ALTER COLUMN id SET DEFAULT nextval('public."Users_id_seq"'::regclass);


--
-- Name: WabaAutomations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WabaAutomations" ALTER COLUMN id SET DEFAULT nextval('public."WabaAutomations_id_seq"'::regclass);


--
-- Name: WabaCampaigns id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WabaCampaigns" ALTER COLUMN id SET DEFAULT nextval('public."WabaCampaigns_id_seq"'::regclass);


--
-- Name: WabaDevices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WabaDevices" ALTER COLUMN id SET DEFAULT nextval('public."WabaDevices_id_seq"'::regclass);


--
-- Name: WabaFlows id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WabaFlows" ALTER COLUMN id SET DEFAULT nextval('public."WabaFlows_id_seq"'::regclass);


--
-- Name: WabaTemplates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WabaTemplates" ALTER COLUMN id SET DEFAULT nextval('public."WabaTemplates_id_seq"'::regclass);


--
-- Data for Name: Campaigns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Campaigns" (id, name, sender, message, "mediaUrl", "mediaType", "totalContacts", "sentCount", "failedCount", status, "scheduledAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ChatFlows; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ChatFlows" (id, "userNumber", "botPhone", name, "triggerKeywords", steps, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ChatSessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ChatSessions" (id, "senderJid", "botPhone", "currentFlowId", "currentStepIndex", context, "lastInteraction", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: MessageLogs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MessageLogs" (id, sender, receiver, message, "mediaUrl", "mediaType", status, "messageId", "createdAt", "updatedAt", "timestamp") FROM stdin;
1	918866813729	918000483847	Test	\N	\N	sent	3EB0DAE30903047757F1BC	2026-09-15 10:56:18.987+05:30	2026-09-15 10:56:18.988+05:30	1789449978987
2	918866813729	918000483847	hello	\N	\N	sent	3EB0E5A928D424095C1694	2026-09-15 12:11:51.394+05:30	2026-09-15 12:11:51.394+05:30	1789454511394
3	232770165039137	918866813729	Hhh	\N	\N	received	3ABB7C78C9FA5A85FF4A	2026-09-15 12:12:05.542+05:30	2026-09-15 12:12:05.543+05:30	1789454525542
4	120363422268949794	918866813729	💥T800 Ultra Smart Watch  ₹458\n\n🔗 https://www.wishlink.com/share/nfz68g\n\n🔗 https://www.wishlink.com/share/6cqswe	\N	\N	received	AC19709180B4EDAC2B2912E4F1FF48B4	2026-09-15 12:12:08.549+05:30	2026-09-15 12:12:08.549+05:30	1789454528549
5	232770165039137	918866813729	Test	\N	\N	received	3A19AE851D49BBE3E36A	2026-09-15 12:12:56.602+05:30	2026-09-15 12:12:56.602+05:30	1789454576602
6	918866813729	918000483847	hi	\N	\N	sent	3EB0840EBB0EF0A8D37B23	2026-09-15 12:19:48.816+05:30	2026-09-15 12:19:48.817+05:30	1789454988816
7	232770165039137	918866813729	Hello	\N	\N	received	3A307E06E6ED97514C57	2026-09-15 12:20:06.672+05:30	2026-09-15 12:20:06.673+05:30	1789455006672
8	918866813729	918000483847	h	\N	\N	sent	3EB04E159D960C275E77B7	2026-09-15 12:25:21.9+05:30	2026-09-15 12:25:21.9+05:30	1789455321900
9	232770165039137	918866813729	Test	\N	\N	received	3AA02C83EF75FA2BEA78	2026-09-15 12:25:30.039+05:30	2026-09-15 12:25:30.039+05:30	1789455330039
10	918866813729	918000483847	scheduled messages	\N	\N	sent	3EB0B2D38F10FDF2E4245E	2026-09-15 12:44:26.358+05:30	2026-09-15 12:44:26.359+05:30	1789456466359
11	918320677031	918000483847	nxc	\N	\N	sent	3EB09414ADC791AFD3082A	2026-09-15 14:55:18.988+05:30	2026-09-15 14:55:18.988+05:30	1789464318988
12	918320677031	918866813729	test web	\N	\N	sent	3EB02E9576C15878C22849	2026-09-16 12:55:13.938+05:30	2026-09-16 12:55:13.939+05:30	1789543513938
13	918320677031	918866813729	test	\N	\N	sent	3EB0E1DD4832E58E6E09C8	2026-09-16 13:00:20.931+05:30	2026-09-16 13:00:20.932+05:30	1789543820932
14	918866813729	918000483847	Thank you for calling LeadPing! We received your call and will follow up with you shortly.	\N	\N	sent	3EB09E85335971F9923222	2026-09-16 15:20:28.613+05:30	2026-09-16 15:20:28.613+05:30	1789552228613
\.


--
-- Data for Name: Plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Plans" (id, "planId", name, days, price, "createdAt", "updatedAt") FROM stdin;
1	starter-30	Starter Plan	30	299	2026-09-15 16:13:27.261+05:30	2026-09-15 16:13:27.261+05:30
2	pro-30	Pro Business Plan	30	599	2026-09-15 16:13:27.261+05:30	2026-09-15 16:13:27.261+05:30
3	yearly-365	Enterprise Yearly	365	2999	2026-09-15 16:13:27.261+05:30	2026-09-15 16:13:27.261+05:30
\.


--
-- Data for Name: QueuedMessages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."QueuedMessages" (id, sender, receiver, message, "mediaUrl", "mediaType", status, "scheduledAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ScheduledMessages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ScheduledMessages" (id, sender, receiver, message, "mediaUrl", "mediaType", "scheduleTime", status, "createdAt", "updatedAt") FROM stdin;
1	918866813729	918000483847	scheduled messages	\N	\N	1789456440000	sent	2026-09-15 12:43:11.137+05:30	2026-09-15 12:44:26.351+05:30
\.


--
-- Data for Name: Sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Sessions" (phone, "dataType", "dataId", data) FROM stdin;
918866813729	pre-key	20	{"private":{"type":"Buffer","data":"AHt5NUxEB5NpM7MB0Z+hsscG2PxCd7qE+IQLzd44WFo="},"public":{"type":"Buffer","data":"TWvOYjg0al0VVR0fxSQ/RO7WQj5qKQenofXYs9aRzhU="}}
918866813729	pre-key	21	{"private":{"type":"Buffer","data":"ANlyqUeWQMA+vEdLyJjSYRFQC4iMe0GQvcSqGLqZ+kg="},"public":{"type":"Buffer","data":"B+Z59Xvc1tNT42R7m/oyiaYzc9UJq6M0ACQJJdRkSnk="}}
918866813729	pre-key	23	{"private":{"type":"Buffer","data":"GA/tdmds92FOO5nN8iuY/uUVjv5bjyrb6uoGZONS0Gc="},"public":{"type":"Buffer","data":"wshEQJwga7flymrE6si7a24vrcxDtxl9yDAk5AxYgR0="}}
918866813729	pre-key	22	{"private":{"type":"Buffer","data":"gIhKfFAhEAISM3iHEFHieUKqXlVYo3DEgc9i722lPmI="},"public":{"type":"Buffer","data":"+4/iHzo2BVar3oXO8soUVlm/AHY0hKNyL5s9xfxoT30="}}
918866813729	pre-key	24	{"private":{"type":"Buffer","data":"YCsVG/tvEOFAp5RRznRucWONMXv/MmLBRBTQuo3qfVM="},"public":{"type":"Buffer","data":"8dg2gmZZoHNkJIHNNrHXgtBqXgxLiF7o3wdKkZHKWhk="}}
918866813729	pre-key	25	{"private":{"type":"Buffer","data":"eDB8e7x5cOrPYqGSbgGdc0L0KAn4PpK1TU9KhPYl/m4="},"public":{"type":"Buffer","data":"eS7gvtQQD1rDNQ1t1J3M418Rx+vDE2eBU+IhWEBkdms="}}
918866813729	pre-key	26	{"private":{"type":"Buffer","data":"YHk+289WIPOJbXdxina4hPMrASXNurLJ451fa1Ed/HY="},"public":{"type":"Buffer","data":"IdBfanyh7aVtpSw6IN0ThYUgUv8NtydQbND8tmVOyUU="}}
918866813729	pre-key	27	{"private":{"type":"Buffer","data":"IFWBrjLXdcWtfaJsIogNUM/d/RTzrMvEdacaXXtHnWE="},"public":{"type":"Buffer","data":"uNKqn429HXCXy77GwbooZUhf71gv3MTJ2PRO2Mz9ajw="}}
918866813729	pre-key	29	{"private":{"type":"Buffer","data":"ICuWEDoMvGOOOHLTekh90Kgq3zn5AYowJKL6o1eXCEQ="},"public":{"type":"Buffer","data":"1x1MBf0D8N/uHTmDEvs3gOwktmq1xWkmuhsbqgRHdB0="}}
918866813729	pre-key	28	{"private":{"type":"Buffer","data":"ACACK2EIdkVSJSiBj6Dc9edgyPa0nD06kGH+jar/O0k="},"public":{"type":"Buffer","data":"yXyycQSaGvFjEDzQXAW9XmJBL6Aoyw5Z1v7Xi2ZXdGA="}}
918866813729	pre-key	30	{"private":{"type":"Buffer","data":"YDwXNx/Dy++2+oMvl3fD/mjL241XBxDseGZmSp9+Pl0="},"public":{"type":"Buffer","data":"dAglQBascrSlnf6r6eIPD7WaJ+7uFI0IQ7pi/uvTZA4="}}
918866813729	app-state-sync-key	AAAAAEkG	{"keyData":"rjuCWKTUscRqv8RWwtUsVEqhMqBdHdk/5MOisCALl8s=","fingerprint":{"rawId":632131959,"currentIndex":1,"deviceIndexes":[0,1]},"timestamp":"1789449933056"}
918866813729	app-state-sync-version	regular	{"version":2,"hash":{"type":"Buffer","data":"ggozxgnGBbVvhfQSysQ6SkmBuRmtLCuB9ZVdIR8VOq9yo+f5CCxtJerLjZ7gM8HprF9yoAHcO9IG8Ffj+u35ZLIAqyTDB6Umdke7hROXOFqf/d8h0P2R8Px914n4qmq3Wn9vsXGZcmzBVW03whE9XDJWA8m1/pRjbDVQY89YT04="},"indexValueMap":{"kRpg3gOB/GvUbAO8Sy3HCcAh4CXHROir0JdfYxJjUr0=":{"valueMac":{"type":"Buffer","data":"4KxfkdBPUj9UumCCVt+HYHzGPv2TALK2zJEPa7Hu+Z8="}},"0PN04T74FR8NgBhjLCPN3bwdDfaoBpXSEGLhHrVDCxU=":{"valueMac":{"type":"Buffer","data":"8hVozAoFtjb8BXg7dSS9XueGrali1vMmfHGyGqKMoXM="}},"PwT4lrHimPPtsSVYdp8legSZHNVI5A7Zuza8kMESH8k=":{"valueMac":{"type":"Buffer","data":"j1trNsXc36wEOq2hgtsss9nPQQoRDPOeiHo7ZxCDcQg="}},"mklDzJknVI3936lS6yywIgXFTmBO0blauUhS/LsO3Q8=":{"valueMac":{"type":"Buffer","data":"3TmR3X09WXoQoDy+1jhYn4xPeU8qNFdjXfWONXcIpXg="}},"T43FayCzPVtGd/IaaEKpxJQRsGytU+3oc8qmT+/mn+Q=":{"valueMac":{"type":"Buffer","data":"Kt7o4IQCWVUzD4uMvkw1yGObhbpzy3ujoSYF5voaDyM="}},"Uvqg5peHIquFWeO6IKkjNhO+hfqJPvUOh8NXoj1sM8E=":{"valueMac":{"type":"Buffer","data":"XoFg6n3lJp1IWDd8b/5RqQRHmrm7zpKyOG+KjZlE1MU="}},"n0tSYSeIxK2NA02Ocl9PIo8/MENS+mZq75kX6k62MCM=":{"valueMac":{"type":"Buffer","data":"2xRhowU90/snoz2G6Xdbf81vT8x60CAYkAkli/upXgU="}},"p3etjJXkBkbU3QDLHsLTZJp7xYq92ilmSIN++eh0Tpw=":{"valueMac":{"type":"Buffer","data":"9MMXKmqq6UiNxhelj3GV5jogGjPDODeOdTGfpuCMd5I="}},"IjHsIaJ5myfSohSi1fm7XLMDLiL3KEIa6UgvV68o/Nw=":{"valueMac":{"type":"Buffer","data":"Bc8U+W9ZTGAjOFtBd80ZuozZwYIIGHtrxZafc+mNBdU="}},"92k0EUsDyV0CYEH9hPoSHrQvhzlFeo5YGbdCCZBUrbM=":{"valueMac":{"type":"Buffer","data":"Pv+3WuwpJi4gTaoe82qDSsF73WTI/lDzhK6UaAAl7P0="}},"XxhbCzfTShkc6zm9gSjD5fB/JcdV9S/Y6ikIOwzfkGE=":{"valueMac":{"type":"Buffer","data":"YR/aPxvf1JLS1s51wpPO6XO4lPpTxquvIvad013+XrM="}},"wQyc4QUPJbNfKEtP40ATOxcpqZZynM9hZsA0NHJWth8=":{"valueMac":{"type":"Buffer","data":"suJ7JT19H+UzPyWtS1a6LqBBpWOeheH9qXVibLQhGl4="}},"+OGCZLVHNKTxV/pqdH0xhx+Tyo69sg6MBQy+JnJ0ioU=":{"valueMac":{"type":"Buffer","data":"F3zx0Nxw97yUHlOJ/EehiofmkI2kQEh7Vikd/XhuQjE="}},"1dyyTjfO0US4p2/CNunKJGYm9mP189/b04Udg7gAWgg=":{"valueMac":{"type":"Buffer","data":"sm7VeSq6TMk38pfRZft1YwOGOnOqZn9v39hdZ+S9aMs="}},"Sj3SD9D+Z40ACHpF8SC8HUVZ0pNtjfXFbgAqElsCxxw=":{"valueMac":{"type":"Buffer","data":"jbKSu3l7cUO24D+S4YQUGeWgBliUqO5f4OLn385izZg="}},"ToAGE39FEnAiscqidN/sYM9ZRPgVZ2If50tgbOHB/4k=":{"valueMac":{"type":"Buffer","data":"whIk6fwVAYHvMgFY35ZwTqDrbCysAKrlLtJT8nBQgew="}},"/zx+rYXD4JYJPhZjkHgcYnkbC20h5FzZBtG0H39fzbs=":{"valueMac":{"type":"Buffer","data":"Adg+Q9KZwiSDuwAG54r79oFI6Cxfa+j2EERxWKLDlFQ="}},"x1Zx1mGAUsdWOoQRy425XJDV2A+g2f498cbEpXdiAmY=":{"valueMac":{"type":"Buffer","data":"VqXWriYo0IjBNiY0rm6KC59KzNO/T5AklYPtltnwGns="}},"XhICgygJ5qry30J4CAnCVCORbLyCF8tKoIzPI+8eyvc=":{"valueMac":{"type":"Buffer","data":"5K6JO/LrCwb4SJQzKlAOCVxKGmq5NGxHoSnk3Ki/KlE="}},"KT50y03jOruGyfPOcE/rUppcIJFYUdPFsKKC2rcOtQo=":{"valueMac":{"type":"Buffer","data":"7vggMvpGQYSNaNMPRMK18iHJ/Ep20GyiSlcojj7Q6+M="}},"yjNtSDt3XafYaevfDUZU6h3kbvAkWgGB1UxkkZTtYco=":{"valueMac":{"type":"Buffer","data":"A1myHfO7fz8J6MZ/dKPn+wPuspRhByFi+P7em9+GtUM="}},"nQ8X7wQLTG9uyas8LXgukAKuVPJX7UDGRpsQWAbyrp4=":{"valueMac":{"type":"Buffer","data":"S5+FfmMN0dJZ0fRDWdSj3fKnl1vq6Foj/wK62EL10fU="}},"ViwKJJNbHmClF7nxQgMpAQBkAfjBWnIrE+ZY671h+f4=":{"valueMac":{"type":"Buffer","data":"/MoV0yXncoBH7kZtlflRd3dxHCzGEcS4xuL7jZOf8/Y="}},"cDOuwj2HTiRu5C+QsX6AnOBCoGHb03nMO1SYBB8YJ7Q=":{"valueMac":{"type":"Buffer","data":"zOGvDhMtlOyLhvaygorzV7W+1CuXKNG3Yla/P4YMJE8="}},"zfH8BJIO/+dTHfFyVJKdPSePkbamvtrJ3RBf9rZTg/s=":{"valueMac":{"type":"Buffer","data":"xUYKoAVFtna153Wc+2g3qsruOJFThZ7qT3WBQolDgJw="}},"ffrTmYdq2vXwcH7cmWi3mCNJgbSXMMTKi2IgKr8hh7g=":{"valueMac":{"type":"Buffer","data":"rPQvAoBnIqupaiGVuz/HmO/QCUdJm368y++rtL2h84I="}}}}
918866813729	app-state-sync-version	critical_block	{"version":1,"hash":{"type":"Buffer","data":"Na1b4fuoThPwywgt7OrZc3R2UwpTllyDvcK6Rw+088+P9TSm3tk6jSorOBlTVRsl6coY0rF/csAHZcD5yV55mA0GSvFEKrlj//kT1NCgaUDq+QJVlwm0rkxTSOnz24RBusnzfNc4TYx/wv94JKasX6uewhEknsvlG2PU5+BNyRY="},"indexValueMap":{"F9h5ZobYq4nGrby6MIZ9VPn6edsmZjyWdOGkIBTd7KI=":{"valueMac":{"type":"Buffer","data":"m2CXuCmcDEQsfOaTVKQYjC9iFatz3VOfRMDgcTGk6OQ="}},"nP8aBYR028smxrR+Ipu/MAfOOzJ/uHathx10wcW/EcQ=":{"valueMac":{"type":"Buffer","data":"p/AJC3ROwRXSGMEDK2n7ZNUxjXu/tz9eBW8n0pAvTDg="}}}}
918866813729	session	918000483847.0	{"_sessions":{"BbCR5ZnlcTp/5QeuxnVGbTTULlcg+Y0D2waY9K9eYad+":{"registrationId":952642004,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BR0uSOURqudQkxVSMdWa6yWAvoOFdCEdz8QxUHexa1xG","privKey":"oOkcAN0VbA73PHULJmXRcwZlVFTWstbW2o7i0NPopHY="},"lastRemoteEphemeralKey":"BeUORCQP/tVWjzVQm6086iT2eNdjPOi63g1Ub560kwYK","previousCounter":0,"rootKey":"F/bSteoYjwmqtqG2PfwEEbHz2Jo2RL0CMTf86lYu3QM="},"indexInfo":{"baseKey":"BbCR5ZnlcTp/5QeuxnVGbTTULlcg+Y0D2waY9K9eYad+","baseKeyType":1,"closed":-1,"used":1789449977991,"created":1789449977991,"remoteIdentityKey":"Bby5SNH+jIE2OtfjC7wStcsoHEWqAVios82IuC4lyE5W"},"_chains":{"BR0uSOURqudQkxVSMdWa6yWAvoOFdCEdz8QxUHexa1xG":{"chainKey":{"counter":5,"key":"BCoyYAxcuL32Pn8tUWtFig2FR4R4XgX+Tc1QetIotvI="},"chainType":1,"messageKeys":{}}},"pendingPreKey":{"signedKeyId":2847746,"baseKey":"BbCR5ZnlcTp/5QeuxnVGbTTULlcg+Y0D2waY9K9eYad+","preKeyId":21167}}},"version":"v1"}
918320677031	session	261636640210959.0	{"_sessions":{"BUbTf07vWGI6oPe6RZsG425aLPiEcVRs40oAwm2T7/Yt":{"registrationId":2116090309,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BY9gfKJ7FPok4kjoHmpGCTa8IxGbr7HYEGeux8Q73vd5","privKey":"+J+f6bqJ9gtHK5s6IDFNcP9wS7ZJ7cJ1fvMbBnRjWVs="},"lastRemoteEphemeralKey":"BXGHpLR7lZFdiVDmd8vUcLEJs0uogQDhmvRcs4C4t58s","previousCounter":0,"rootKey":"4+ihyrYAlx8qz39ZQVvIoRA46Gr+LVQknOeZlXlj9ao="},"indexInfo":{"baseKey":"BUbTf07vWGI6oPe6RZsG425aLPiEcVRs40oAwm2T7/Yt","baseKeyType":2,"closed":-1,"used":1789550537956,"created":1789550537956,"remoteIdentityKey":"BSVd5Mlgw+uopaj5yDSKosUwDgaJASyv0VoAfzAlva0k"},"_chains":{"BXGHpLR7lZFdiVDmd8vUcLEJs0uogQDhmvRcs4C4t58s":{"chainKey":{"counter":0,"key":"saptBrsfT/Gnn+BvIon9KD+sLjxklmnFEcSYdKZb2ag="},"chainType":2,"messageKeys":{}},"BY9gfKJ7FPok4kjoHmpGCTa8IxGbr7HYEGeux8Q73vd5":{"chainKey":{"counter":-1,"key":"OXn8OqL9goTx3frki1IV6SDTJEzilyMvIe/a69rrhuc="},"chainType":1,"messageKeys":{}}}}},"version":"v1"}
918320677031	session	918320677031.0	{"_sessions":{"BSaTNWTZuFS+VWCzBLRZSDjxeSq4NHDxKl3hQBHICco3":{"registrationId":343165355,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BU96YgpPzx6unGVAeF7IXdW5DGppQO80mXgGuhuAwYp3","privKey":"aKxfGpQdifVr3MA0mIDECPfwDzIYwdoYGjkur7iRsX4="},"lastRemoteEphemeralKey":"BTVtXTYJ6DfD7YB8CPwB8hQSPhAgoP04HEYdbWcAEn4f","previousCounter":0,"rootKey":"6bfEJsQilKEjDn3qYRbHOkyBJG0YlZYzhO/dOG6MJUQ="},"indexInfo":{"baseKey":"BSaTNWTZuFS+VWCzBLRZSDjxeSq4NHDxKl3hQBHICco3","baseKeyType":2,"closed":1789557460970,"used":1789551962514,"created":1789550507155,"remoteIdentityKey":"BdBKVWaFEafXWZpIfIfjHxHaZskKOxGKg0WOX/OkR2kr"},"_chains":{"BaMtN+kwkZp0w/2tfwcB1qlQnWNMg2kDOXGbQN+7/YlT":{"chainKey":{"counter":2},"chainType":2,"messageKeys":{}},"BXR6yOrbmIRnrL5CWFDa0kyBZ2fu61X9jHiG3axiAa0f":{"chainKey":{"counter":7},"chainType":2,"messageKeys":{"7":"gf8fM6Kcx+yvmFsRuMj0P6HfAJUjg18X3Wqvcxlh0XA="}},"BTVtXTYJ6DfD7YB8CPwB8hQSPhAgoP04HEYdbWcAEn4f":{"chainKey":{"counter":0,"key":"O2WIhYT2F7o9QGUDfS34w5mjS4Ii1F5MLtn2CHn6dDw="},"chainType":2,"messageKeys":{}},"BU96YgpPzx6unGVAeF7IXdW5DGppQO80mXgGuhuAwYp3":{"chainKey":{"counter":0,"key":"I6MH5f9eQge9fwjPHIPMCsI0akDHZUZpZ58V1BgzWcE="},"chainType":1,"messageKeys":{}}}},"BcHiYGk5hZ7q7gtBS4MSrb6E7n0A2f3EtCID9ja4gT8X":{"registrationId":343165355,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BUfaPQ91mOAwICHovjUIf9AYxvP5WYrtJ8cd3jPdWlEc","privKey":"WFjxL2/WOoRi39TDvfmNcguVPzBqT/RH77mP9XvTrH0="},"lastRemoteEphemeralKey":"Bamy71IDEry/HUaQmKejaYd7iUGWFWf1luzOgxFrnvV2","previousCounter":0,"rootKey":"iG3f39GoXaznSDoPG6Bn+OX5tG3DZ3RU/7Z97frj/2M="},"indexInfo":{"baseKey":"BcHiYGk5hZ7q7gtBS4MSrb6E7n0A2f3EtCID9ja4gT8X","baseKeyType":1,"closed":-1,"used":1789557460962,"created":1789557460962,"remoteIdentityKey":"BdBKVWaFEafXWZpIfIfjHxHaZskKOxGKg0WOX/OkR2kr"},"_chains":{"BUfaPQ91mOAwICHovjUIf9AYxvP5WYrtJ8cd3jPdWlEc":{"chainKey":{"counter":-1,"key":"+GOF9+JEC6Da8U3r0nJUH11d9Gm8d3caEw0EpqRXWnQ="},"chainType":1,"messageKeys":{}}},"pendingPreKey":{"signedKeyId":14998024,"baseKey":"BcHiYGk5hZ7q7gtBS4MSrb6E7n0A2f3EtCID9ja4gT8X","preKeyId":3045338}}},"version":"v1"}
918866813729	pre-key	1	{"private":{"type":"Buffer","data":"wOR/jVLv3E74jGLOTgezJeeNIoLw9xEtu/TdQSkzgnw="},"public":{"type":"Buffer","data":"w8/1jT5Ro84NAWOB3zQ/SimMq09neblBfCnwK/0tZHQ="}}
918866813729	pre-key	2	{"private":{"type":"Buffer","data":"IHfWIy7S298uRwOKuRJ223jZtGyALGBhndLs97/1Vlo="},"public":{"type":"Buffer","data":"cFZrNEsITF9M0yFqGROZi36Qpa8AdpENkYPw9J0eEmU="}}
918866813729	pre-key	4	{"private":{"type":"Buffer","data":"YMRLmSB2Qckq0hvQn+YBY1MVPPOKUzqMKcCWqmEiRFk="},"public":{"type":"Buffer","data":"uXwww5lB4O82vx/tRfp8Fr8SqFuwIE151po8uOW3nw4="}}
918866813729	pre-key	6	{"private":{"type":"Buffer","data":"IKxMbN1ybtG9T6EQ3sewZyyGVmWzsrY9kR7TmnuQqng="},"public":{"type":"Buffer","data":"J8LTxAiVLdNg8XFQMf6Hk2vHOHEe0uVl2Up7Vv/Mh2M="}}
918866813729	pre-key	5	{"private":{"type":"Buffer","data":"6C5SKyQWYmsNvCU3U2Afln9izBxR5S5nzDJvOHdaRlA="},"public":{"type":"Buffer","data":"UmEzaebqxuTUgT+L7hxNmUHAyRS/rUZuynMRLQY5dxM="}}
918866813729	pre-key	8	{"private":{"type":"Buffer","data":"GGRBmsNsd6b/PevwqzR7Q70KrpMB4nLBb1BMbtDVSnY="},"public":{"type":"Buffer","data":"o5ScZPxn45NLO/bfA5AWsQ9T5JHq1JZ5RcKnqyNoIxE="}}
918866813729	pre-key	9	{"private":{"type":"Buffer","data":"SPWPCfhOHCmr3ek6sGpEI4iIV+Oi+Oc4Fo/bYRpLUko="},"public":{"type":"Buffer","data":"t9Zm9L8Fm/72K6VlRbnfi7iZzbxCin6HcAL6Gzy8kzQ="}}
918866813729	pre-key	10	{"private":{"type":"Buffer","data":"8N6INUrNl9vOyMxgs/EdYoj0eyrK4gTjVl173NwGwEQ="},"public":{"type":"Buffer","data":"T7o3N74H8ZinbYkaH5mvea5n26r/nYZdYIRxnmY87ks="}}
918866813729	pre-key	11	{"private":{"type":"Buffer","data":"yI6u57bumWJiDo8UmhYYPDStz6l3seTcjSOEuGuibGk="},"public":{"type":"Buffer","data":"DaJix+Bpff127JR2IVyETXa2v6avivwtGbrhOex5YkM="}}
918866813729	pre-key	14	{"private":{"type":"Buffer","data":"ON32huSiAuqhNgiYmrZlTRFZyaAAA3GcIokZsIJhkkc="},"public":{"type":"Buffer","data":"9Wy7o1zpg1Oryg89cgIWRG5cZgxY6uhw7HLV6VTD1yU="}}
918866813729	pre-key	13	{"private":{"type":"Buffer","data":"yJZST+9g2xlF6uaBsvlRw/qQJKHu6nwg6JFABRs7i0E="},"public":{"type":"Buffer","data":"vZDaxmPsrtYquVrxLoCFkMRCM29Bc88/xfIw1sGuLjk="}}
918866813729	pre-key	12	{"private":{"type":"Buffer","data":"iM0lNG3yKcnHWnEA4VLFKGo40uimRhW+/GJaPjuvP08="},"public":{"type":"Buffer","data":"JVjTzw9F0nLr6o2ERqCmARntcvKWlTyy6ms834RGgGk="}}
918866813729	pre-key	16	{"private":{"type":"Buffer","data":"8CctahcebBplQJ/uNK9ninAAh5Dm5AzrmCQUIbl8L3g="},"public":{"type":"Buffer","data":"iX2WWsLYN02sXCP8GsKDB+5KzRwwfjja3zYrgNifpGw="}}
918866813729	pre-key	15	{"private":{"type":"Buffer","data":"kFSS7MbBfybDjXsKOcDCt0KcqJWaUiSXALUSMJ7/4F8="},"public":{"type":"Buffer","data":"Frb6nZbp1xdjz8T8bP4uESx7zxXHemvNNccJJUc6f00="}}
918866813729	pre-key	17	{"private":{"type":"Buffer","data":"iIEBV7xzXBmgTL553ySIoyNYW0XlO4z//+nYqrvXBnc="},"public":{"type":"Buffer","data":"+M9Hjgqot2bKOVy5ukNYeUHRCjeJCYAJniIUy2Ftd3A="}}
918866813729	pre-key	18	{"private":{"type":"Buffer","data":"0Pa2YFIqtUDZ/t9uRLO1EHLOVqGsmZnewVRF2jjZIWw="},"public":{"type":"Buffer","data":"/hjQ7qP9UjDKV1/HWi+NAOd3fuutozWY/v08mibHaG0="}}
918866813729	pre-key	19	{"private":{"type":"Buffer","data":"sODRfgaMbn95OyFJiupqdSNiBn/WUnzIehfkWQUcBGg="},"public":{"type":"Buffer","data":"F04m5PitsRAyMcjk5YOu/kEWqr/YCxhLvvXUiuFWNVg="}}
918866813729	pre-key	31	{"private":{"type":"Buffer","data":"UFLXdIhOGc/HCTsWWCY84XRPUqoDvrxRzGQrw+5i9XQ="},"public":{"type":"Buffer","data":"VWXNkqoDW4haOi6eP/XKe7qD1byOLm22meiuTFzCKSg="}}
918320677031	app-state-sync-version	critical_block	{"version":9,"hash":{"type":"Buffer","data":"0PG6Cqf16hMUsgVxmlGRijDUqbvVLYj0MyeRlyV8FCMM/BEMuNasICCMIqsoaLe2T73gT8w1H6FRW/ugcU9ZGKhyt8hB00ADuAiSqkaBX2rRDBoiL1DGfFT8+5MlxxPoXBlB/LrltCcKmrnTUbDBZZy3OV6EdVCosS+dBSWIzCw="},"indexValueMap":{"VaPHPjdfyGI+GtWZrcwCJptjRX6Y95WEsd02tOkhQ2k=":{"valueMac":{"type":"Buffer","data":"qTw1FZh5QxJGDWbygu1l5y5eCnH6s2rbSLsXAtCjS7o="}},"dkGj4Vcl/x3Bwm/LX1tESM7uigp39YFmQuUZH6IdYmQ=":{"valueMac":{"type":"Buffer","data":"A5RHeJaPtoc2O8lgwTQIHBSWhKLzzfIkte3qJTZFsoA="}},"Ysvj3Ciy9u7NytY168V9NRoBJT1m9EV5tIoMaWibVlc=":{"valueMac":{"type":"Buffer","data":"e5eNug5XGcm546xnRH+ozlWiOFR2s8uxJJBpRZZjISM="}},"UB6DuiCX6JmkRp0dEUObEuJdBMLzmcQcXMa6wvdenmQ=":{"valueMac":{"type":"Buffer","data":"09zrdWkFWUi04gsgno6HC4HVTQB2Rwtc2CSlfbQXKgE="}}}}
918866813729	session	918866813729.0	{"_sessions":{"Ba0FhZZt61eFS2dMQYONVXypQPIGGxc34g/K1CFqf6YK":{"registrationId":4274826,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BbkUMtf0lpTwPp4zorJcAXHiugx3fDXIob8v2pGzy0AM","privKey":"iEk7deFptE7mlpRWJ7RSwaLiJrdoVaXWG7hqeuvDrnQ="},"lastRemoteEphemeralKey":"Bb0Z1fF2kKIe/4+cSDxfmaasrcbPXrAbJWwZ+nRzO4AR","previousCounter":4,"rootKey":"IywQNk+CeLG5AQk1sg7u6ZZEKAvg31n0PG2h/c5cYUk="},"indexInfo":{"baseKey":"Ba0FhZZt61eFS2dMQYONVXypQPIGGxc34g/K1CFqf6YK","baseKeyType":2,"closed":-1,"used":1789466419261,"created":1789449934238,"remoteIdentityKey":"BRFke80F4rUIiCaqpotvT9IkrJfODIl/D33EtZIoKVJH"},"_chains":{"BZms07qiXka6ex1p0Ce4Wv4SsILnIT/mA9qIoMw10Fkl":{"chainKey":{"counter":7},"chainType":2,"messageKeys":{}},"BTzd87VHwDFmrCsm9B01URMn8y9pzqufkfhrEHu/ONY/":{"chainKey":{"counter":0},"chainType":2,"messageKeys":{}},"Bb0Z1fF2kKIe/4+cSDxfmaasrcbPXrAbJWwZ+nRzO4AR":{"chainKey":{"counter":1,"key":"yYrpBEhpXFlSrNRWBrpp92Q+Un/hPbdUxxDbp7IJe+4="},"chainType":2,"messageKeys":{"0":"rUrQMAAjOh7jkRvoAMwG+JKRUaF7BY7UCHqc8Jai1Vs="}},"BbkUMtf0lpTwPp4zorJcAXHiugx3fDXIob8v2pGzy0AM":{"chainKey":{"counter":0,"key":"/aJVu62h9ugNaiyga6DNcFhEcnP4WL2y6Vnx1Y3B5FY="},"chainType":1,"messageKeys":{}}}}},"version":"v1"}
918320677031	pre-key	37	{"private":{"type":"Buffer","data":"KIMctc3/yv5Cnp7y4oAD4Oz77Aw1xfxD9yjtyon5qV4="},"public":{"type":"Buffer","data":"TEf7nr+yIqcNzgP6ft9w371yQ5KQB+t7l7tP75YQVmA="}}
918320677031	pre-key	42	{"private":{"type":"Buffer","data":"+HfgyJ14RVv/v3UckZvW3D8hk4F3MkIsF6GzubacTFo="},"public":{"type":"Buffer","data":"8xsGCTx4bO9+T6qfbO3LmQhngYtZ77n1nYs3DV0mrG0="}}
918320677031	pre-key	49	{"private":{"type":"Buffer","data":"2H3vK2eZLDMosQJu3fRtEGPfTeiEziJPsmXxqLdb6kI="},"public":{"type":"Buffer","data":"gTULvFdmCvWsYxDsBJzxxUMPDGkIybCx3h3rezXE2w0="}}
918320677031	pre-key	55	{"private":{"type":"Buffer","data":"gM2IIXQHiTxBWPGB7Yt1fnE94DwtjrYYCcOm3LbN3n4="},"public":{"type":"Buffer","data":"uvMjd20rdLkUrAkE6c/pIoSB51fCktkVWE+TfcVwzQQ="}}
918320677031	app-state-sync-key	AAAAAKQQ	{"keyData":"GgCqMf1s0e3P5fGrWyXCkh/ifkRAD2KTLPA8nS0AcoE=","fingerprint":{"rawId":2022896382,"currentIndex":8,"deviceIndexes":[0,2,3,8]},"timestamp":"0"}
918320677031	app-state-sync-key	AAAAAKQV	{"keyData":"2d8UzgQ7WlNfjsOZYU8A+GmhaMXZZMdbLvSQ/RF0Ass=","fingerprint":{"rawId":2022896382,"currentIndex":12,"deviceIndexes":[0,2,10]},"timestamp":"1789465310869"}
918320677031	pre-key	2	{"private":{"type":"Buffer","data":"8AHfD4AYwibj+m5KlGgYjdf9TKhcTGL8s2x/Sa88wmQ="},"public":{"type":"Buffer","data":"LQaAqUDIsOiZ0fLPlg6qnLwe4m6Q+5JuM7j3k4RVQgU="}}
918320677031	pre-key	6	{"private":{"type":"Buffer","data":"QPzt8e+xo+9STbImay5xP1PkPv3Ym/0F1yFfHl1HJHk="},"public":{"type":"Buffer","data":"q372UGwtowXtTKOtTzDHrGJ76LDEr1AGbjMMqgXRNi8="}}
918320677031	pre-key	8	{"private":{"type":"Buffer","data":"SAM/TgcBtlCIZBoARcZ6M/RADfpbwQ0P/xANBqKfzHE="},"public":{"type":"Buffer","data":"IYfh+/PFdO1thmDb0YD3+vpbCKxG/0FVPFGnU8AA4EM="}}
918320677031	pre-key	15	{"private":{"type":"Buffer","data":"ALxPxsdJ9vJnWe5zAC3O1JknTGygzoLETqDxKvQMSFI="},"public":{"type":"Buffer","data":"vUkZmwM7MTaZh+/Nb9iN22XfI6XdQxPwnqXlG7pNIUk="}}
918320677031	pre-key	21	{"private":{"type":"Buffer","data":"MGYULlG9q/B6sqRUzItMFrgk7A62UUH4pT8nqTQouX8="},"public":{"type":"Buffer","data":"Id54UuXfAtdPk+rhHxbYQS8EimSALaphhSSsBjosgQk="}}
918320677031	pre-key	25	{"private":{"type":"Buffer","data":"GGYNFqnfx5DR29LeqiK9lFq6J+b6cBMytCzxEa+EcnM="},"public":{"type":"Buffer","data":"iT/Sr8hiPRf+Z13sGFbrZQjFATG6/yMHSkyyyy6teDg="}}
918320677031	pre-key	28	{"private":{"type":"Buffer","data":"YAuoY6xjZ6oVz7B0hyTM4X1N1qeOmOSOeE7BzGiT03Q="},"public":{"type":"Buffer","data":"2yaZ7oKrSEayB5uglwn0ivEM2lCeIoEh6xcTod4lYxo="}}
918320677031	session	32461396377799.0	{"_sessions":{"BeWhhGV0RjtZkBDtxssXeMVHPlnfDzymCiRIRoZNODtY":{"registrationId":518378450,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BShI+UjPl190OSwaf84cMhfs/0drE0Mbw8Z9eyneXzRc","privKey":"uMlHo2GlWHwhcdMX0DQzpxGZWlN/1VpVLAlMIsxdxHM="},"lastRemoteEphemeralKey":"BQMYOg0ouF8rkwiacd8UkY1VOJLDKEwYB34M45fbFEst","previousCounter":0,"rootKey":"PzAMTVl0dRRi1HkEzpqf6KEOGN+HEstOLq58MGPtpcY="},"indexInfo":{"baseKey":"BeWhhGV0RjtZkBDtxssXeMVHPlnfDzymCiRIRoZNODtY","baseKeyType":2,"closed":-1,"used":1789553918951,"created":1789553918951,"remoteIdentityKey":"BReBcMFsEMWCpvyF5LN7dZQhuPnxFD28/c8i0mpQxZ46"},"_chains":{"BQMYOg0ouF8rkwiacd8UkY1VOJLDKEwYB34M45fbFEst":{"chainKey":{"counter":2,"key":"gd5oadeKsiWF7okrhwFavvO77J5etW/F2SSTvlRkaV0="},"chainType":2,"messageKeys":{}},"BShI+UjPl190OSwaf84cMhfs/0drE0Mbw8Z9eyneXzRc":{"chainKey":{"counter":-1,"key":"agcC32V2lD/Mkl6UuHZtQhOEM/ZU5iC/UNsggX0uhNg="},"chainType":1,"messageKeys":{}}}}},"version":"v1"}
918866813729	session	140836490715296.0	{"_sessions":{"BXwXscgKW/mdT3F3ZN75PFQjW0C4rnAVsIA7Dw2YtD06":{"registrationId":4274826,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BdRYDjMuBogTwyrkoWbkF7rO+YJBfrSf8fVeg+bXlOoF","privKey":"GP/F5NYqhAyRm9xvIZG+o9NveMnU13F9NpWs5nWX3W4="},"lastRemoteEphemeralKey":"BdhkNlSJB+FS6nGj//SIJlisECT/g6lLoHWrmj6X/8QM","previousCounter":0,"rootKey":"Q2G+Up3aBUf39CK8cG82j/jFGi3id2q5GQMpp+pNtgk="},"indexInfo":{"baseKey":"BXwXscgKW/mdT3F3ZN75PFQjW0C4rnAVsIA7Dw2YtD06","baseKeyType":1,"closed":1789466424289,"used":1789454514091,"created":1789454514091,"remoteIdentityKey":"BRFke80F4rUIiCaqpotvT9IkrJfODIl/D33EtZIoKVJH"},"_chains":{"BdRYDjMuBogTwyrkoWbkF7rO+YJBfrSf8fVeg+bXlOoF":{"chainKey":{"counter":7,"key":"JutjGON1Qy1dNwG/UASuxu2VFQXC2KnfuFmbh0sBNZo="},"chainType":1,"messageKeys":{}}},"pendingPreKey":{"signedKeyId":4069836,"baseKey":"BXwXscgKW/mdT3F3ZN75PFQjW0C4rnAVsIA7Dw2YtD06","preKeyId":13344144}},"BTMazeAx0JfHtecHRIs1p/aQBEpCaujwHNwCS0+lR3Jh":{"registrationId":4274826,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BWNLkdqHWwonPwBUSxsG3vb2AjIs2k+IP+EeodqL3fZD","privKey":"QAUX6ukj46DJbKie3TUP2h0F9iMjkCfZLswExqYV3VI="},"lastRemoteEphemeralKey":"BUCt5v3nradPoibkEofRcNp0ibR2gKiyxmE5XcDeaBVR","previousCounter":0,"rootKey":"FB2Njx90J5hwTIUWNGudziHEby/b3oY6jVcuO2Zyk+c="},"indexInfo":{"baseKey":"BTMazeAx0JfHtecHRIs1p/aQBEpCaujwHNwCS0+lR3Jh","baseKeyType":2,"closed":1789552256602,"used":1789466424294,"created":1789466424294,"remoteIdentityKey":"BRFke80F4rUIiCaqpotvT9IkrJfODIl/D33EtZIoKVJH"},"_chains":{"BUCt5v3nradPoibkEofRcNp0ibR2gKiyxmE5XcDeaBVR":{"chainKey":{"counter":2,"key":"Wvtw7T8L+aFhsgkPdO+sIzQBliwdZWOszo2vFsEL6eg="},"chainType":2,"messageKeys":{}},"BWNLkdqHWwonPwBUSxsG3vb2AjIs2k+IP+EeodqL3fZD":{"chainKey":{"counter":0,"key":"Aq5QMWl+Jyks6fMx6H8enswDru06FHBgOIwE2yUEPvs="},"chainType":1,"messageKeys":{}}}},"BXvosebgXpn/wcbdkT7lVFjcXzeNMLQLT3f3Wn8sdKt2":{"registrationId":4274826,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BcsSWpOASZgHIXKGyFySzLo7vQepVOKoDMcep3ARtCUu","privKey":"mGcNaC9tHdTarsJifp5a37qNjSLRS0EbiR2ywBxPqn4="},"lastRemoteEphemeralKey":"BdhkNlSJB+FS6nGj//SIJlisECT/g6lLoHWrmj6X/8QM","previousCounter":0,"rootKey":"m/xqgOyJDwv+AxWqhIPLTVrqd1wzu7m6npupwfOAn0A="},"indexInfo":{"baseKey":"BXvosebgXpn/wcbdkT7lVFjcXzeNMLQLT3f3Wn8sdKt2","baseKeyType":1,"closed":-1,"used":1789552256593,"created":1789552256593,"remoteIdentityKey":"BRFke80F4rUIiCaqpotvT9IkrJfODIl/D33EtZIoKVJH"},"_chains":{"BcsSWpOASZgHIXKGyFySzLo7vQepVOKoDMcep3ARtCUu":{"chainKey":{"counter":0,"key":"zNd6UqYb6IGFqktcAbXCMf0KLUEZ63JpKRXL6sPgaJU="},"chainType":1,"messageKeys":{}}},"pendingPreKey":{"signedKeyId":4069836,"baseKey":"BXvosebgXpn/wcbdkT7lVFjcXzeNMLQLT3f3Wn8sdKt2","preKeyId":13344137}}},"version":"v1"}
918866813729	session	232770165039137.0	{"_sessions":{"BW5S5V1lio3D8OY5NW89WXCV7sVL8nflHeeKv1YrqPw6":{"registrationId":952642004,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BSmhDehUd74AyalaQ7ZjcCKU9UiBhqd7K4X14VFQVQoU","privKey":"yGd/xOyHekZorYHBc+D5H/F1edUwKSjiU+wx1iIJZ3g="},"lastRemoteEphemeralKey":"BXaF3+blsGAzmtyN3DmU4HN/al78XGe9Pw1NBQuxweZn","previousCounter":0,"rootKey":"ReacgOImAagxuclmts3UxKtfknOof9shwyk9b080KWY="},"indexInfo":{"baseKey":"BW5S5V1lio3D8OY5NW89WXCV7sVL8nflHeeKv1YrqPw6","baseKeyType":2,"closed":1789454513377,"used":1789453421773,"created":1789453421773,"remoteIdentityKey":"Bby5SNH+jIE2OtfjC7wStcsoHEWqAVios82IuC4lyE5W"},"_chains":{"BXaF3+blsGAzmtyN3DmU4HN/al78XGe9Pw1NBQuxweZn":{"chainKey":{"counter":2,"key":"K2izm1nKrBrtErhk2B45pcIoVzHC4/l8MTc4Rs3ZaNk="},"chainType":2,"messageKeys":{}},"BSmhDehUd74AyalaQ7ZjcCKU9UiBhqd7K4X14VFQVQoU":{"chainKey":{"counter":-1,"key":"/jyLSFcZWXyGA3m+9BjjcBZH6Yw9YxhpfrHRkA0GceE="},"chainType":1,"messageKeys":{}}}},"BfrbO2J96QI+zythpSQe7tJbpCChC0vJksWbnvPoNJ4g":{"registrationId":952642004,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BVqn7tqP2U2Oz1P39Gtny8O7hr2lwgLv8Tzb3rnKECFQ","privKey":"IO4U1GF2bRx5aE7uP/F6ygR44tpPH7vImNedcrAbkkY="},"lastRemoteEphemeralKey":"BeUORCQP/tVWjzVQm6086iT2eNdjPOi63g1Ub560kwYK","previousCounter":0,"rootKey":"NfeACQTbFBRlDTgU026FcKbBYE9uJoZl6s0244DTcIQ="},"indexInfo":{"baseKey":"BfrbO2J96QI+zythpSQe7tJbpCChC0vJksWbnvPoNJ4g","baseKeyType":1,"closed":1789454519272,"used":1789454513371,"created":1789454513371,"remoteIdentityKey":"Bby5SNH+jIE2OtfjC7wStcsoHEWqAVios82IuC4lyE5W"},"_chains":{"BVqn7tqP2U2Oz1P39Gtny8O7hr2lwgLv8Tzb3rnKECFQ":{"chainKey":{"counter":0,"key":"XNKJysy3SreDH1KPkXMUCo0RmFUkmL3diJ9PKEUyhlI="},"chainType":1,"messageKeys":{}}},"pendingPreKey":{"signedKeyId":2847746,"baseKey":"BfrbO2J96QI+zythpSQe7tJbpCChC0vJksWbnvPoNJ4g","preKeyId":21133}},"BXc7JuWbCVDsoEYcp9ABDoxswkm/FYRxy7BDOKXYfYI7":{"registrationId":952642004,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BVl63jVRvFn+nBPZXp0gPI6FGRieO7eofh74chwKrnw1","privKey":"EJ+ZfkUCRmFwY+studMmea+6AkoW6XTaNdBogp24+VY="},"lastRemoteEphemeralKey":"BeUORCQP/tVWjzVQm6086iT2eNdjPOi63g1Ub560kwYK","previousCounter":0,"rootKey":"XC6UQJ5Seq6Hi3V54bqNvYOOVPyesbXqR4NNHGs8mlY="},"indexInfo":{"baseKey":"BXc7JuWbCVDsoEYcp9ABDoxswkm/FYRxy7BDOKXYfYI7","baseKeyType":1,"closed":1789454990544,"used":1789454519265,"created":1789454519265,"remoteIdentityKey":"Bby5SNH+jIE2OtfjC7wStcsoHEWqAVios82IuC4lyE5W"},"_chains":{"BVl63jVRvFn+nBPZXp0gPI6FGRieO7eofh74chwKrnw1":{"chainKey":{"counter":0,"key":"Ebn0Vu1ia3APUROtDCJI/o8gwoiaM2AX/R00BWZ0Urc="},"chainType":1,"messageKeys":{}}},"pendingPreKey":{"signedKeyId":2847746,"baseKey":"BXc7JuWbCVDsoEYcp9ABDoxswkm/FYRxy7BDOKXYfYI7","preKeyId":21376}},"BWl3Q3wPi6poQBQry12Dt5FpK92oOk0AfFl8Xm8wo3A1":{"registrationId":952642004,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BbHHdt591UKTeq/yCVCJ6Fc96C/JT2SUg5dwF/LK34Vo","privKey":"mIEf/qXA9jgeVtR7WUAnLhyaVpXhnatsTWKX5WecW2M="},"lastRemoteEphemeralKey":"BeUORCQP/tVWjzVQm6086iT2eNdjPOi63g1Ub560kwYK","previousCounter":0,"rootKey":"h+YYn4YUWtgwZ99QkS2ozMOMbUEcjptAJj9e8ilBR+0="},"indexInfo":{"baseKey":"BWl3Q3wPi6poQBQry12Dt5FpK92oOk0AfFl8Xm8wo3A1","baseKeyType":1,"closed":1789455002355,"used":1789454990535,"created":1789454990535,"remoteIdentityKey":"Bby5SNH+jIE2OtfjC7wStcsoHEWqAVios82IuC4lyE5W"},"_chains":{"BbHHdt591UKTeq/yCVCJ6Fc96C/JT2SUg5dwF/LK34Vo":{"chainKey":{"counter":0,"key":"i5Xvdar5ocRi4czN8nX09Rs5UVMBKE1IRUMQ+ivFBwE="},"chainType":1,"messageKeys":{}}},"pendingPreKey":{"signedKeyId":2847746,"baseKey":"BWl3Q3wPi6poQBQry12Dt5FpK92oOk0AfFl8Xm8wo3A1","preKeyId":21422}},"BZGAV7oEyhAFFzDpg+c4U2WHbBAxIeyo9D2/tIr3jFs7":{"registrationId":952642004,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BVwyohjOSSYLXhYIbR1Ppbrvs8m39c2/wZ0WBkDcghR1","privKey":"EJZ8Y0nLJCA/+XKpqilr9TzaAXQnMB7MHEQ65nLDPE4="},"lastRemoteEphemeralKey":"BcyumOqi/qDZyw2Er4YCwgfbq+OxuKx9nAnP51JdYUEV","previousCounter":0,"rootKey":"Etc/6l4b0HOLTM7UQ43zxAqdWj6/sVBc3HDckQpkBik="},"indexInfo":{"baseKey":"BZGAV7oEyhAFFzDpg+c4U2WHbBAxIeyo9D2/tIr3jFs7","baseKeyType":1,"closed":1789455324980,"used":1789455330029,"created":1789455002347,"remoteIdentityKey":"Bby5SNH+jIE2OtfjC7wStcsoHEWqAVios82IuC4lyE5W"},"_chains":{"BcyumOqi/qDZyw2Er4YCwgfbq+OxuKx9nAnP51JdYUEV":{"chainKey":{"counter":2,"key":"LmR/SB0JRkaj3kAJ/KSvZlqJfGw99jL543CQlOXqWY0="},"chainType":2,"messageKeys":{}},"BVwyohjOSSYLXhYIbR1Ppbrvs8m39c2/wZ0WBkDcghR1":{"chainKey":{"counter":-1,"key":"8gcIc5Hr5wRUZq3w5oj5kzrtIZF8U6bSwYzlj9dJFyA="},"chainType":1,"messageKeys":{}}}},"Bf7alSePzD5DmN1NOlEDqzRPJCGQHbO+vAEgyBOp2rBg":{"registrationId":952642004,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BYOr+/Fv0ixdAIDp4fJTXGmsKvaDdO3EBr9MjA63/lMY","privKey":"eLgHEqUH9L9NK26wU80+OSI+ZIsDKi41l+PO+toUMU4="},"lastRemoteEphemeralKey":"BcyumOqi/qDZyw2Er4YCwgfbq+OxuKx9nAnP51JdYUEV","previousCounter":0,"rootKey":"wpzJDDfFRS4e+2hQRNVC2eugTAvi6XOyIdUbPtbYS+U="},"indexInfo":{"baseKey":"Bf7alSePzD5DmN1NOlEDqzRPJCGQHbO+vAEgyBOp2rBg","baseKeyType":1,"closed":1789455327527,"used":1789455324973,"created":1789455324973,"remoteIdentityKey":"Bby5SNH+jIE2OtfjC7wStcsoHEWqAVios82IuC4lyE5W"},"_chains":{"BcyumOqi/qDZyw2Er4YCwgfbq+OxuKx9nAnP51JdYUEV":{"chainKey":{"counter":2,"key":"m+t9Pbl+XDvJ9HXGAP3LQLJTr7HOqNmVu6RZ387anWM="},"chainType":2,"messageKeys":{"0":"x3HFk8t2ZK7lRPQLYd9J5Ghr/P81Vq7TS0sbKvwq6dU=","1":"UEapCoiS2++aqgvVlDnnARdvz3j/AUAVHX2g08XW99w="}},"BYOr+/Fv0ixdAIDp4fJTXGmsKvaDdO3EBr9MjA63/lMY":{"chainKey":{"counter":-1,"key":"Wudc95v1gYQ+cHVgSVb77E4zdO1LHNuuoczEA2zM2g4="},"chainType":1,"messageKeys":{}}},"pendingPreKey":{"signedKeyId":2847746,"baseKey":"Bf7alSePzD5DmN1NOlEDqzRPJCGQHbO+vAEgyBOp2rBg","preKeyId":21216}},"BRZYjRcwKc8or1NQ6i/qivuYCgDBQiNYWylkhA6uA9RU":{"registrationId":952642004,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BST0yMk3+x9aR/mcO+7InBaPLS05SBkA/k/wdjTaIyA1","privKey":"8E5o5KIjFL/m6YDXJ7XAqlI/sGr+NpAEdF9n88MW7XY="},"lastRemoteEphemeralKey":"BcyumOqi/qDZyw2Er4YCwgfbq+OxuKx9nAnP51JdYUEV","previousCounter":0,"rootKey":"L/KJ+S+LsFhL2K4UTCFKbUoY4B/gXK2l1zxsyDPsilo="},"indexInfo":{"baseKey":"BRZYjRcwKc8or1NQ6i/qivuYCgDBQiNYWylkhA6uA9RU","baseKeyType":1,"closed":1789456468172,"used":1789455327519,"created":1789455327519,"remoteIdentityKey":"Bby5SNH+jIE2OtfjC7wStcsoHEWqAVios82IuC4lyE5W"},"_chains":{"BcyumOqi/qDZyw2Er4YCwgfbq+OxuKx9nAnP51JdYUEV":{"chainKey":{"counter":2,"key":"uzFPj2rOuVN6CgThzNOKfCsL2xu9Sl0UZNeEgbd7ILk="},"chainType":2,"messageKeys":{"0":"YQZTM1J4mYFbGyOq4lM21u/pSkxqGcbvpJTJz1g1I8M=","1":"Szf5sSbK4PvAQgyTnsp7mtOM3Te1TsaRHPcTXS+FmP8="}},"BST0yMk3+x9aR/mcO+7InBaPLS05SBkA/k/wdjTaIyA1":{"chainKey":{"counter":-1,"key":"9p4SuKCoqSLbEQhsO++TdqNZno4TxVC8M6Qsdj+Pch8="},"chainType":1,"messageKeys":{}}},"pendingPreKey":{"signedKeyId":2847746,"baseKey":"BRZYjRcwKc8or1NQ6i/qivuYCgDBQiNYWylkhA6uA9RU","preKeyId":21366}},"BcUQNts06yZs1jVCMr6AVvv/MNeFGWqPYhgPF5M/32p3":{"registrationId":952642004,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"Bb9ypxHXtQVnoBVJpeoQZI9LfpvDRidBqnbzS0Bf0spL","privKey":"EKxHCFqd/W3IRFxflFomj6VofC+V1UIpkQ2csSJNAFg="},"lastRemoteEphemeralKey":"BeUORCQP/tVWjzVQm6086iT2eNdjPOi63g1Ub560kwYK","previousCounter":0,"rootKey":"+wfKtdvjFtjZYHJfudc7NVHmnZDiY6SYhPUdzyt2Rc4="},"indexInfo":{"baseKey":"BcUQNts06yZs1jVCMr6AVvv/MNeFGWqPYhgPF5M/32p3","baseKeyType":1,"closed":1789456498477,"used":1789456468161,"created":1789456468161,"remoteIdentityKey":"Bby5SNH+jIE2OtfjC7wStcsoHEWqAVios82IuC4lyE5W"},"_chains":{"Bb9ypxHXtQVnoBVJpeoQZI9LfpvDRidBqnbzS0Bf0spL":{"chainKey":{"counter":0,"key":"zL7gVEPhabw0Kchp7mEwEgix/I2zd5nbwAZOtlgx5m0="},"chainType":1,"messageKeys":{}}},"pendingPreKey":{"signedKeyId":2847746,"baseKey":"BcUQNts06yZs1jVCMr6AVvv/MNeFGWqPYhgPF5M/32p3","preKeyId":21384}},"BeBtMeolQV0FrRc9/BRJOLpPWrAuzSiVbVXcsowDVQEy":{"registrationId":952642004,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BRACHdSSJCv33nQTnufKIKKgMDyTABCDFcWCH94xanEX","privKey":"oGN2Xq+Az9ylBr1TPztdcfEEanloU9dVltqmx0NOfkg="},"lastRemoteEphemeralKey":"BT5dnbtHXILffFR5RzfCVOpIvOx2ByVBMmaiY36f7kZf","previousCounter":0,"rootKey":"YipDz8HkxOQnktRsn0Zbvx0Tzvlcp15ZdQF+BE7tTyw="},"indexInfo":{"baseKey":"BeBtMeolQV0FrRc9/BRJOLpPWrAuzSiVbVXcsowDVQEy","baseKeyType":1,"closed":1789552230967,"used":1789538970991,"created":1789456498470,"remoteIdentityKey":"Bby5SNH+jIE2OtfjC7wStcsoHEWqAVios82IuC4lyE5W"},"_chains":{"BT5dnbtHXILffFR5RzfCVOpIvOx2ByVBMmaiY36f7kZf":{"chainKey":{"counter":0,"key":"MxOasfuLMR3AYq7KNYLF/kjgQDrIJ4wwf74l1mZrpgY="},"chainType":2,"messageKeys":{}},"BRACHdSSJCv33nQTnufKIKKgMDyTABCDFcWCH94xanEX":{"chainKey":{"counter":-1,"key":"oSoK+RcVGQlZjahfrgVpwIlBOYluxzFfFf9CVg2PsH8="},"chainType":1,"messageKeys":{}}}},"BcMY1f1mteLsCKiO2Gn+Xkx9ss9m8KUYM+FDxufZVktf":{"registrationId":952642004,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BQC13RKO7W5fp4ssitSR/c6XPg5wQYLmUhr8S4EGd9Ep","privKey":"4IDj3Et0SvO6S36H+b7qnAHbCru8hRJq9IVzTslsMmY="},"lastRemoteEphemeralKey":"BeUORCQP/tVWjzVQm6086iT2eNdjPOi63g1Ub560kwYK","previousCounter":0,"rootKey":"NylJ6J40qrKPF/5GQxr3vRXBjFpCDS3foCwjuVYcTHk="},"indexInfo":{"baseKey":"BcMY1f1mteLsCKiO2Gn+Xkx9ss9m8KUYM+FDxufZVktf","baseKeyType":1,"closed":-1,"used":1789552230938,"created":1789552230938,"remoteIdentityKey":"Bby5SNH+jIE2OtfjC7wStcsoHEWqAVios82IuC4lyE5W"},"_chains":{"BQC13RKO7W5fp4ssitSR/c6XPg5wQYLmUhr8S4EGd9Ep":{"chainKey":{"counter":1,"key":"v2omxDfrly01G58fHf/fg/71WImzVHlTuHMROcNF11Q="},"chainType":1,"messageKeys":{}}},"pendingPreKey":{"signedKeyId":2847746,"baseKey":"BcMY1f1mteLsCKiO2Gn+Xkx9ss9m8KUYM+FDxufZVktf","preKeyId":22291}}},"version":"v1"}
918320677031	pre-key	41	{"private":{"type":"Buffer","data":"qK6jUnGLOJIOiqcd8JmGCsEfMPcKrLwqC8e+WkpQE20="},"public":{"type":"Buffer","data":"FD7u2yH591fuonp2jRPfa80XzCLKYboWQvXYK4titXo="}}
918320677031	pre-key	44	{"private":{"type":"Buffer","data":"UE/vEGtl5e81v88g8uyDuLlTUZ6f7WwEpS9HDeqSVV8="},"public":{"type":"Buffer","data":"GYxff1yRNwGr+T/ViDfz/lJV2Y1c17zus5HSq0tl7DA="}}
918320677031	pre-key	47	{"private":{"type":"Buffer","data":"mAEylFJHs+I5d15P9bUw5j2/46FwEMyQlfezQswh61E="},"public":{"type":"Buffer","data":"c7FsuaAEOcfwTe72Nm6nZ/96zmblSZdxlx3LUPUyaQ4="}}
918320677031	pre-key	51	{"private":{"type":"Buffer","data":"IP+E8mwzgtM+Qr4g4oNRhFsxwuKlRS4ZdhZunUxBe1c="},"public":{"type":"Buffer","data":"fZdanYrXwPzQQ0VnVm62iZI0K1kwYbQnQ9swPm5w/D0="}}
918320677031	pre-key	56	{"private":{"type":"Buffer","data":"cLt/hmYZe/Jts3YG7iCspFlKP8JN53BKVgN0t/9f4nA="},"public":{"type":"Buffer","data":"lkujInKVM4svll+AIdp9RLP3zANO1ibqSBfwg7PpeCw="}}
918320677031	pre-key	59	{"private":{"type":"Buffer","data":"cJB4yp+2JxQHYTDUou8Q+q/RRNlSAkyVIzgwTzTsx1g="},"public":{"type":"Buffer","data":"V8iG4CvAGgHWbwH5TV03pTymQHAXxIbbNB7aD+D9lRM="}}
918320677031	pre-key	9	{"private":{"type":"Buffer","data":"ePUC2Ao9QGcN59jtEv1+wjnYyMGJespB6e95it0sRmQ="},"public":{"type":"Buffer","data":"/yPhp8gPgQLBrljmT5rO6Qwp3Lds6XQSmPmc4TdN9z8="}}
918320677031	pre-key	17	{"private":{"type":"Buffer","data":"WK2kNzVPc7B/+9XQAhsxse4YositPgp0Vksk2FSnZEs="},"public":{"type":"Buffer","data":"FsMXYCjhc5kKKa7C2dh/pVH4tnQKVZ/tAoIHy7lC3Sc="}}
918320677031	pre-key	22	{"private":{"type":"Buffer","data":"aPh02N89bW6TznQGtJTyhK8oDpvGZYQjaOnSjABR23E="},"public":{"type":"Buffer","data":"DJyglhnjZCf3lgn0jh1OEkruwYhwyvjDYs9OZsJ+sRA="}}
918320677031	pre-key	27	{"private":{"type":"Buffer","data":"EIie2uzPWI33BqRyOU+swsFhmEhqMZpYWEZBo1OoU3k="},"public":{"type":"Buffer","data":"MQK3wlX2OF2cT+e23IVrGKsdiAll8SXL6fVf1lzOj1U="}}
918320677031	app-state-sync-key	AAAAAKQP	{"keyData":"Troj0Gyl3YB+WiurpcxO3sDLJwFhXMqs+DP7mpMbK+E=","fingerprint":{"rawId":2022896382,"currentIndex":7,"deviceIndexes":[0,1,2,3]},"timestamp":"0"}
918320677031	app-state-sync-key	AAAAAKQM	{"keyData":"rXD0CTuVA7EO++TmeY6/W739IA5G/XB7/PtsX8U0YcE=","fingerprint":{"rawId":2022896382,"currentIndex":1,"deviceIndexes":[0,1]},"timestamp":"1785908302579"}
918320677031	app-state-sync-key	AAAAAKQU	{"keyData":"E18jmKdRuw44E2LaZx1EWFs7iKWJTGsYx8XMJTXy7nU=","fingerprint":{"rawId":2022896382,"currentIndex":11,"deviceIndexes":[0,2,10]},"timestamp":"1789464710993"}
918320677031	app-state-sync-key	AAAAAKQY	{"keyData":"dmtznUhsmZuDU+fy4DJx5zrF9cjpijMcJQue3VhTqwE=","fingerprint":{"rawId":2022896382,"currentIndex":16,"deviceIndexes":[16,0,14,15]},"timestamp":"1789550909629"}
918320677031	pre-key	69	{"private":{"type":"Buffer","data":"QHwOQatdvwOzoVHVxQC0TrYZsncBP+d1t8tc3fFTb0M="},"public":{"type":"Buffer","data":"jRIOZCSGDEwk3wHhuDmd9QI6kWW6C4lhaFWDEVSgQCU="}}
918320677031	pre-key	38	{"private":{"type":"Buffer","data":"uEqLdwt7fGIvOumUqc2kd/ihuW1SQpE9PdCEf/fFp2c="},"public":{"type":"Buffer","data":"MYQaGQg9lheTylM6ih2uoQLyLQUZgLhvayY5ucQC4Ww="}}
918320677031	pre-key	74	{"private":{"type":"Buffer","data":"iAmRL/eerCzlDTG/spIRgNsZnJ4JGoPPokOsCWDyr24="},"public":{"type":"Buffer","data":"0Uex0T53xVuLFVNBnVdgzLRow2NK4BtqSpfA98FoUio="}}
918320677031	pre-key	46	{"private":{"type":"Buffer","data":"gK331dX9Yk9irRA9dsL5R+6/lOXW8lNNpRDrPepQ5kQ="},"public":{"type":"Buffer","data":"XBAyiESJ6w1SmiKWE9q8UbFNQIB+mjILrk0nvT52rXM="}}
918320677031	pre-key	53	{"private":{"type":"Buffer","data":"IMQiCDu+N1mgyD26/Bz2Mg3vLSyn4qU8uSTODlQQN3Y="},"public":{"type":"Buffer","data":"srXznFuPiYrHT7xvKUuVpbRTi+Zgzknb2YIY5ue8Og0="}}
918320677031	pre-key	58	{"private":{"type":"Buffer","data":"GE62ZIfiiV23c13Fg4uw1yXTwqecU4YkS1gez3Kr33s="},"public":{"type":"Buffer","data":"rQ6mxJRcGUN2IpJn+b3oj21EkZt5x/3kbR2gPfNxgyE="}}
918320677031	pre-key	79	{"private":{"type":"Buffer","data":"WJ8ErI91+8Enuu9BZoD184X8QzYZdvQLLM8ALFMWdW4="},"public":{"type":"Buffer","data":"oSdF+lL6Blstm+lQus8M+SEq9v2C5/WqUyCeTewJJxs="}}
918320677031	pre-key	83	{"private":{"type":"Buffer","data":"kJqcjKpx9cEGBM0gAG6N7ov7FyKee00Y0UpCDpXiSWw="},"public":{"type":"Buffer","data":"5AAmpuCNIYAhlWKTn2dRwQqebmibaL6GleV+4RIaAAI="}}
918320677031	pre-key	87	{"private":{"type":"Buffer","data":"EDwxtPYx0r2n+4QyQEYzZtZ+SY9ZyDVEiyDQczcFo1Y="},"public":{"type":"Buffer","data":"TXSPgR2KCrUjoXnKwhX6m3g0WZ4n0+1ZBq8c8ryWSgY="}}
918320677031	pre-key	91	{"private":{"type":"Buffer","data":"IBMDWr4TFSXBXcazuVY4Dbl6VOqoTd0orCTbdyVFOno="},"public":{"type":"Buffer","data":"D4dk0IJLYIN8XW/940JmF43phE2OunJim03ze/0cGCc="}}
918320677031	pre-key	10	{"private":{"type":"Buffer","data":"GKgKzvYKhSlIDYRy0tRUnK93uxkjKYBdkG4j/7WlCU8="},"public":{"type":"Buffer","data":"IME+vQTs5SuuojiIji9y54vXxUMOdDR3KEVApConyGw="}}
918320677031	pre-key	18	{"private":{"type":"Buffer","data":"UJf/YQohRS/tgE0CBbhP/vOSauH9+UMrKoKOI+KShHI="},"public":{"type":"Buffer","data":"06jKZPiGqr60NvaB8e/05TQ2wSBUHxufmpz0hnuD0RI="}}
918320677031	pre-key	23	{"private":{"type":"Buffer","data":"QDfRnxmhZ90pKVeozxQn4CSCYCh1j6AJnxOMLekD2lo="},"public":{"type":"Buffer","data":"rW7UWjksl2S6MiKVMLhaPrlyfCAgJLqtvX0PaDEEShI="}}
918320677031	app-state-sync-key	AAAAAKQN	{"keyData":"Ik423d0CP9YJ8+Wltf1/hSPYObcryqZr1gXIXajOAhQ=","fingerprint":{"rawId":2022896382,"currentIndex":4,"deviceIndexes":[0,1,2,3]},"timestamp":"1787632786918"}
918320677031	app-state-sync-key	AAAAAKQW	{"keyData":"+fxlcmu+zcAq+lHKDjjJMCko+Rb0cMzyZLNDrUKbtRY=","fingerprint":{"rawId":2022896382,"currentIndex":13,"deviceIndexes":[0,2,10]},"timestamp":"0"}
918320677031	session	274289546788993.0	{"_sessions":{"BZjPIXMosDhb+v0MQo6nLKIIiffZSUH4oDfWFDpOJSVz":{"registrationId":1295828319,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BV48kB7//QeUvddJFlS7RIDPCLQbxeKfAJP/fOEb/XVM","privKey":"AAgC4euoCh336GMGgAmqriagPOzxRp9qqDqKaDBeumY="},"lastRemoteEphemeralKey":"BUsS5i5ucNwNdkphf5REetlGL4yoOEUBMGywTqJm7QUJ","previousCounter":0,"rootKey":"FjU/rqpdQo6wlFFdTMPWgwA7zDfPQhxoLUbXAyR4x6o="},"indexInfo":{"baseKey":"BZjPIXMosDhb+v0MQo6nLKIIiffZSUH4oDfWFDpOJSVz","baseKeyType":2,"closed":-1,"used":1789550940370,"created":1789550940370,"remoteIdentityKey":"BUobc76SQstc59+YdjGw5TSk1UTOpF6CBASyX5bTb5Nk"},"_chains":{"BUsS5i5ucNwNdkphf5REetlGL4yoOEUBMGywTqJm7QUJ":{"chainKey":{"counter":0,"key":"l2dQqt4CR/rB35rMX/B49k7CHRVnBNEg18zf5jenCLs="},"chainType":2,"messageKeys":{}},"BV48kB7//QeUvddJFlS7RIDPCLQbxeKfAJP/fOEb/XVM":{"chainKey":{"counter":-1,"key":"zx4cA7yEGLRuh8ckXs1CbVlDvlo7aXb5+CtAOH683W8="},"chainType":1,"messageKeys":{}}}}},"version":"v1"}
918320677031	pre-key	61	{"private":{"type":"Buffer","data":"2Gw5Xzfgwo5i0NeyEnsjrb8+/K9+BmvgoAk3m9W6dU4="},"public":{"type":"Buffer","data":"ZklZQajRG3eu6lwk2BuGZD6wuJKFo0QcWS8LsACAaD8="}}
918320677031	pre-key	70	{"private":{"type":"Buffer","data":"SKaxxVql1mGwsHQcFLsdIL5Cn24GFmz2mUztZaP3Ync="},"public":{"type":"Buffer","data":"AaBU9zug/+ObDESXpNd9t9apUYfmq2u3Ud+VuVCFSx0="}}
918320677031	sender-key	status@broadcast::274289546788993::0	{"type":"Buffer","data":"W3sic2VuZGVyS2V5SWQiOjQ3OTY1NzMxLCJzZW5kZXJDaGFpbktleSI6eyJpdGVyYXRpb24iOjQsInNlZWQiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOlsyMzAsNDAsMTUyLDQxLDEyMiwxODQsMjAxLDIwNiw3Myw0MSw4OCwxMDQsNTksMjEwLDIzMywxMzIsMTA1LDIzLDkzLDI0NywyOSwxMzQsMTk2LDUzLDUwLDc4LDk1LDEsMTMyLDE5MiwxNDksMTU2XX19LCJzZW5kZXJTaWduaW5nS2V5Ijp7InB1YmxpYyI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6WzUsMTU4LDAsMjksMTksMTc3LDEzNCwyMzksMjMyLDIyMSw2NiwxMzQsMjIwLDk3LDE1MCw4NCwxOTEsMTU0LDE0Myw3Miw0OCw2NSwxMjIsMjQ3LDUxLDksNjksMzQsOTksMTMsMTQ4LDE5OSw0MV19fSwic2VuZGVyTWVzc2FnZUtleXMiOltdfV0="}
918320677031	session	224167345524856.0	{"_sessions":{"BW4GOo+O4RblJdqao3eejEUO8x2A+i9rD4sCscUzYao0":{"registrationId":1213076691,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BWwuDeYyDNjUva+5bR2SGJaVPCcyb+bi+E68ARSlr9UD","privKey":"iFVJt7UVJeS6h22prZuW3GoNw0WnHlGnS8UuUQBaAnQ="},"lastRemoteEphemeralKey":"BUgFtzZocnExWMJ2xhDjCRJmeO6SbWi/4Zlt2q2m50sc","previousCounter":0,"rootKey":"EKCnHU02ytm2W2UWtG22UcDurEoDJQqp1FE0GZysZfg="},"indexInfo":{"baseKey":"BW4GOo+O4RblJdqao3eejEUO8x2A+i9rD4sCscUzYao0","baseKeyType":2,"closed":-1,"used":1789552478680,"created":1789552478680,"remoteIdentityKey":"Bbt8V7Pkr8cgDNF1OY25Lwu0falhhn2p1rGdZHwUTEd/"},"_chains":{"BUgFtzZocnExWMJ2xhDjCRJmeO6SbWi/4Zlt2q2m50sc":{"chainKey":{"counter":0,"key":"V1yYhpP2IYmZLSteD0dG3bhR2N4I36xy6ofNfP38XCw="},"chainType":2,"messageKeys":{}},"BWwuDeYyDNjUva+5bR2SGJaVPCcyb+bi+E68ARSlr9UD":{"chainKey":{"counter":-1,"key":"i7a1EE3ohOuj/1b/6PnC6N0hbfqvLJgbBCIxaDE6d/s="},"chainType":1,"messageKeys":{}}}}},"version":"v1"}
918320677031	pre-key	75	{"private":{"type":"Buffer","data":"2MziC5BcHaxZAa/RQt7du/n7az6at6qwHTh3SgoLFW0="},"public":{"type":"Buffer","data":"XYAyoVEiKitqDbl9iefpe6O3zBZYuX0R5TupuLSsFzM="}}
918320677031	sender-key	status@broadcast::224167345524856::0	{"type":"Buffer","data":"W3sic2VuZGVyS2V5SWQiOjgwMDY4NjM0NSwic2VuZGVyQ2hhaW5LZXkiOnsiaXRlcmF0aW9uIjo1LCJzZWVkIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjpbMjAxLDE2NywyMzYsMTkxLDkwLDI1MSw5MCwxNDgsMTUyLDM0LDIwMSwxODUsMSw5NCw5NiwxNDYsMTA2LDI0OCwyMzUsMTI5LDIwNCw4OCwyMjksMjAwLDE5MywyMzMsODksMTQ4LDIyMywxNjUsMjA5LDE3M119fSwic2VuZGVyU2lnbmluZ0tleSI6eyJwdWJsaWMiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOls1LDEwOSwxNjgsMjAwLDIzMiwxMDUsMTU2LDE2NSwyMDEsMTgyLDEsNzYsMjM3LDIxLDE5OSwxNjgsMTE4LDg1LDE1OSw1MSwyNTQsMTY2LDk2LDUzLDEzMiwzNCwyNTQsMzksMjIsMTA3LDc1LDI0MiwyN119fSwic2VuZGVyTWVzc2FnZUtleXMiOltdfV0="}
918320677031	sender-key	status@broadcast::149022849425523::0	{"type":"Buffer","data":"W3sic2VuZGVyS2V5SWQiOjQ0MzIwOTI1MCwic2VuZGVyQ2hhaW5LZXkiOnsiaXRlcmF0aW9uIjoxLCJzZWVkIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjpbMjIzLDM1LDIzNiw0Miw4OSw3MSwxNTksMzMsNTcsMjIyLDc1LDIwLDI0LDg5LDk5LDgsNjEsODgsMTEyLDUwLDE2MSw5NiwxNzAsMTM2LDIyNywyMzEsMjI1LDE5OSwyNTUsNjksMTI1LDIzXX19LCJzZW5kZXJTaWduaW5nS2V5Ijp7InB1YmxpYyI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6WzUsMTMsMTk2LDIxMywxODAsMjAsMTU4LDEzOSwyMzcsMjE3LDIzNCwxMzgsMTE5LDc0LDEzNywxLDk2LDE4MSwxNzYsMTgsMjgsMTAyLDEzNiwxMTQsNTgsMjMzLDYsMzEsMTYyLDI0NCwxMTAsMjM1LDQ0XX19LCJzZW5kZXJNZXNzYWdlS2V5cyI6W119LHsic2VuZGVyS2V5SWQiOjIwMzE0MDY2MTYsInNlbmRlckNoYWluS2V5Ijp7Iml0ZXJhdGlvbiI6MSwic2VlZCI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6Wzc3LDE5NSwyMzAsMjE5LDQ4LDg3LDE1Niw1OSwxMiw1NywxMzYsMTU2LDQsMzgsMTA3LDg0LDIzNiwxNjYsMTI4LDU0LDMyLDU3LDIxMywxOTEsMjI0LDIxLDIyMSwzMywxNjAsMTcyLDE1NiwxMF19fSwic2VuZGVyU2lnbmluZ0tleSI6eyJwdWJsaWMiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOls1LDUwLDg4LDEwOSwxMDUsMjU0LDExMywyMzQsMTU1LDM3LDE0NiwxNTQsMTIsMTgyLDcxLDE1Miw2MywyMjksMywxMzAsMTk0LDE4NywyMzIsMTc3LDQ5LDEwMSwxOSwyMTMsMTQsMTU5LDE5Myw2NCwxMTFdfX0sInNlbmRlck1lc3NhZ2VLZXlzIjpbXX1d"}
918320677031	pre-key	80	{"private":{"type":"Buffer","data":"yLeSMnVYX39rAKwxTSJvP7wLZaGyu3+Rhi6MYvWmIHA="},"public":{"type":"Buffer","data":"2OyP4Ss7ZyKkPIn6GauuEfBLMhKH2ouIlJlbm7cydnw="}}
918320677031	pre-key	86	{"private":{"type":"Buffer","data":"qF9qzkMSmo3Kx4yjiFNTPbGIxFV6AmaE6rUoZ+bXpGg="},"public":{"type":"Buffer","data":"3e/kd4rLU/v3XxweZcIaYXkCvsrbLdKlC0zdrBGxsW0="}}
918866813729	creds	base	{"noiseKey":{"private":{"type":"Buffer","data":"KGpetnHgh2bF7PQN1bVuZ2e+SutxCm3w2x4CKP79UkQ="},"public":{"type":"Buffer","data":"NDpbaPuceMJF1YYeKLJrT4ElOEbSy88aQOZuvBJgNQc="}},"pairingEphemeralKeyPair":{"private":{"type":"Buffer","data":"UGup0F1GfaFr7Ig/ntupm7qmp1p8xekBbNLZT84pFmA="},"public":{"type":"Buffer","data":"odJL7DXiSLbemBiDe0+TlhQsPqdxEZ2euRlqyPJ1NQs="}},"signedIdentityKey":{"private":{"type":"Buffer","data":"EMR1/h/vhxH7Rq7dZFHlULmAEaarcvDhCfaEbMBSm04="},"public":{"type":"Buffer","data":"t5TW64GHixFX1Vdf01dDytCK0gZJ0PJQ96rdbocBbSo="}},"signedPreKey":{"keyPair":{"private":{"type":"Buffer","data":"0ElMQVZFEjoDNIEmqcmKYXd++80IzZvtOJik0VIocl0="},"public":{"type":"Buffer","data":"WF3t3JRcYMz4KyBn89mzdAVh4zmtDSdoeBu75paI21Y="}},"signature":{"type":"Buffer","data":"7HAeqBZZ9CJ3URRCZ2a/N1jQfTAd/I9R4gycvBoS2yu+r9YgfJjxpAyidcuc7usmIjd23TdP/zInczjbm/XQCg=="},"keyId":1},"registrationId":188,"advSecretKey":"6a2s6natYva6qCTBNWXNUj8mlJRbAkD3XDCQm6L1S7A=","processedHistoryMessages":[],"nextPreKeyId":33,"firstUnuploadedPreKeyId":33,"accountSyncCounter":0,"accountSettings":{"unarchiveChats":false},"registered":false,"account":{"details":"CPeitq0CEMato9UGGAEgACgA","accountSignatureKey":"EWR7zQXitQiIJqqmi29P0iSsl84MiX8PfcS1kigpUkc=","accountSignature":"eApwTXL3DwGH1nBIcMJ2LLlF8HEFOYjSvPH04+OxDsWj9Q9RCgHd3bqV7iG/ecdsUlGGEl4MsVA9F7b/2nthCA==","deviceSignature":"T+AAl30DCLG21XzCn5LTeboljcidmaIPcxu5m74DAhPL6KrmB8fc0yxNLsHScilDUaBqwIHSIvfu6myLzC0sCQ=="},"me":{"id":"918866813729:93@s.whatsapp.net","name":"Robinson","lid":"140836490715296:93@lid"},"signalIdentities":[{"identifier":{"name":"918866813729:93@s.whatsapp.net","deviceId":0},"identifierKey":{"type":"Buffer","data":"BRFke80F4rUIiCaqpotvT9IkrJfODIl/D33EtZIoKVJH"}}],"platform":"smba","routingInfo":{"type":"Buffer","data":"CAIIEggI"},"lastAccountSyncTimestamp":1789453409,"myAppStateKeyId":"AAAAAEkG"}
918320677031	pre-key	5	{"private":{"type":"Buffer","data":"yEKn1TK9P1buLi886FxjIbYJUWud32fLhWB4L8F3P3A="},"public":{"type":"Buffer","data":"Ng7vwJD6fl2iag3Q2bt9+ETRr8m9zQrlMmghPrklKg8="}}
918320677031	pre-key	12	{"private":{"type":"Buffer","data":"OOeenOH/IUb/wcJA2nALoq5/lpeGzCSWy44GEJmgImo="},"public":{"type":"Buffer","data":"k0lf/UsgchDLOGnWpv96JElku4gTF70pma8OBlptXlE="}}
918320677031	pre-key	19	{"private":{"type":"Buffer","data":"6OEi+Ue3wzoGvOgmGOTgkqUxztIxE/slx+R8r637D0c="},"public":{"type":"Buffer","data":"/4VLINzQvFOpy3Plv5wzrLLVw+wYagItX1+yicsVrjM="}}
918320677031	pre-key	24	{"private":{"type":"Buffer","data":"0CYt7us91KARKUkHAqRoKSG7jW/5CV1Q+c6WJftW9Uo="},"public":{"type":"Buffer","data":"t777BdAz3zDFd/sr0yMOsu19tHowoP/HZIytXNRABAY="}}
918320677031	pre-key	29	{"private":{"type":"Buffer","data":"WFwlcZRodr21ZRJxNlL3xRMJ7dV5PdgSX4/cQFDFLlg="},"public":{"type":"Buffer","data":"KkvZsrHmdQlMlcIAoFXzg24hRnRY8y/ZCDvOIkkG8Qs="}}
918320677031	pre-key	13	{"private":{"type":"Buffer","data":"qOD8Y1+Qq5oakFSE3S89XjX+m5ut7m/rmkF15ra76lQ="},"public":{"type":"Buffer","data":"224F5l0UOuCJOtzBVSG1sUNQVa7mgHtCWc0mtwaHZ08="}}
918320677031	pre-key	16	{"private":{"type":"Buffer","data":"2ILjrGnEOGOKApaXlt2YCiJIGDlpOSmfGO9XYXABenQ="},"public":{"type":"Buffer","data":"N2ZoqbqFRSkm00PHJx7Lh9Kd1yslijyoWtPLkAjf2Bg="}}
918320677031	pre-key	20	{"private":{"type":"Buffer","data":"EBDGH1IETvUmEJ4cDejdm/R7sJuQK79DUPYyxXczlmc="},"public":{"type":"Buffer","data":"xHdH3JoHx3nfo/7UUSxaVzW1V4sIBtfHdamKxeUGCFs="}}
918320677031	pre-key	26	{"private":{"type":"Buffer","data":"wI5a/Uecd0anqaMnVTuy83BsxwrBLnq5GVOGWSHiS3Y="},"public":{"type":"Buffer","data":"UMba1BfYUmvK3rifhJmDD+Y1excrOrS+5EO7o5qWnmk="}}
918320677031	pre-key	30	{"private":{"type":"Buffer","data":"KNtcXg/OdIHGm0bCvuUD1qBY32R7yD5ELecVFjNfsGA="},"public":{"type":"Buffer","data":"eTTtNx4hQlQcT9vyRHJH96EWzAkr6Cz2l0gXpFXwkHU="}}
918320677031	app-state-sync-key	AAAAAKQS	{"keyData":"SiViRSgdl+JoGngGzrCz/3S9mv/K0xTkO/jPJVgZCrc=","fingerprint":{"rawId":2022896382,"currentIndex":9,"deviceIndexes":[0,2,8]},"timestamp":"0"}
918320677031	app-state-sync-key	AAAAAKQX	{"keyData":"d4m0LVzpbNANURe6jZehvw0g6vM/NNR9LFkOT8ke9l0=","fingerprint":{"rawId":2022896382,"currentIndex":15,"deviceIndexes":[0,10,14,15]},"timestamp":"1789550481926"}
918320677031	session	245534774325311.0	{"_sessions":{"Bcj5TPc26HNkzVQNt21vdH39W5hdUIx6uNP5wr9NsvoL":{"registrationId":1010257576,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BezcKLWM5/6pWIpLRem+fPNRMZ7Y3rNxlytA2h48PNJq","privKey":"2CdAJq5kknD6JAAYEfvVnD5IZJw6snzbEamvMzsiwEE="},"lastRemoteEphemeralKey":"BUZ8uBYKsuhpXqO1VYFXuf8e7ZTXj7CGo4ux+Gf7P7F9","previousCounter":0,"rootKey":"++5/WP3v2HN4BH5KBOnP665HJJwFTXIXt5Ns5xoYJ+U="},"indexInfo":{"baseKey":"Bcj5TPc26HNkzVQNt21vdH39W5hdUIx6uNP5wr9NsvoL","baseKeyType":2,"closed":-1,"used":1789551572483,"created":1789551572483,"remoteIdentityKey":"BempVrY+FPV/XNDe2YmHR0TrK8loVcf1YKDjPgWKNNZA"},"_chains":{"BUZ8uBYKsuhpXqO1VYFXuf8e7ZTXj7CGo4ux+Gf7P7F9":{"chainKey":{"counter":0,"key":"q+xmVvVKvblFGAeQyxxVx4lqnWCfyVdhdyEQsF59VOo="},"chainType":2,"messageKeys":{}},"BezcKLWM5/6pWIpLRem+fPNRMZ7Y3rNxlytA2h48PNJq":{"chainKey":{"counter":-1,"key":"HhpEhhklodfLLC6fPtUiLzzUoDQICRB2kAnYQcCotRQ="},"chainType":1,"messageKeys":{}}}}},"version":"v1"}
918320677031	session	149022849425523.0	{"_sessions":{"BZNnItkAgd3BlJTzdyu3LnttGwQ+fim+PkrVbC88s78o":{"registrationId":1172020949,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BcLJd6Yp2Nb4f4C6jqZpf04Z3fcYFjXAtNyGf98AAe9v","privKey":"QL11w2/1FowWj4Um0hOYqkrobp/YWfVzfcWq5VeQi2k="},"lastRemoteEphemeralKey":"Ba4kooxtwu2rKqH3vRsJmZl0rt5aTztYr8twMO3n/G1+","previousCounter":0,"rootKey":"L7WNP7sFK+hN5ayNgq5IAi8b8YV26XYtkOGarUHMyZw="},"indexInfo":{"baseKey":"BZNnItkAgd3BlJTzdyu3LnttGwQ+fim+PkrVbC88s78o","baseKeyType":2,"closed":-1,"used":1789553933283,"created":1789553933283,"remoteIdentityKey":"BZxYUcZ6nSS0lKnbUkfhdqmTyM0fH4sekghriWMlwXBn"},"_chains":{"Ba4kooxtwu2rKqH3vRsJmZl0rt5aTztYr8twMO3n/G1+":{"chainKey":{"counter":1,"key":"JjUs/oexOrxGtXaCNTZyARcj6GpvIHXiy0F60QCIPDQ="},"chainType":2,"messageKeys":{}},"BcLJd6Yp2Nb4f4C6jqZpf04Z3fcYFjXAtNyGf98AAe9v":{"chainKey":{"counter":-1,"key":"Hj+XOBnrTn7xGwU6JJ73ij4guZ+vt3U01Idt8LaFjOw="},"chainType":1,"messageKeys":{}}}}},"version":"v1"}
918320677031	sender-key	status@broadcast::245534774325311::0	{"type":"Buffer","data":"W3sic2VuZGVyS2V5SWQiOjM2MDM5MTgzNywic2VuZGVyQ2hhaW5LZXkiOnsiaXRlcmF0aW9uIjoyLCJzZWVkIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjpbMTg1LDQ4LDIxMSwyNCw3NywxNzYsNTEsMTc5LDk1LDUwLDEyNCwxNDgsMTI5LDE5OCwyNCwxMzAsMjU1LDU4LDI0NSwxMTgsODIsODksMjEzLDE2NSwxMzEsMTA0LDEzOCw2MSwyMTAsNzMsNDgsOTJdfX0sInNlbmRlclNpZ25pbmdLZXkiOnsicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjpbNSw4LDExMCw5OSwyNDAsMjUxLDgwLDU0LDksMjQ4LDIyMCwxMTcsMTcwLDE4NCwyMTQsNjEsMTUxLDE3NywxMTcsMTQ1LDE1NSwxOTksNDAsMTA5LDIsMTMsNCwyMTIsOTIsMTMyLDIzMiw5NywxMTddfX0sInNlbmRlck1lc3NhZ2VLZXlzIjpbXX1d"}
918320677031	pre-key	36	{"private":{"type":"Buffer","data":"0Ny6AtDPXbnGlGDFxccuowpBg2xTsJcabDjUF+/xg3Y="},"public":{"type":"Buffer","data":"ELYvjifLuvY3Vlhlos+UnmNo0lS6T33W29l5WOThuXw="}}
918320677031	pre-key	43	{"private":{"type":"Buffer","data":"mNbUp4z7Pgzh36qr+bsUecMdiV/aAjEevIkgaKeLpEc="},"public":{"type":"Buffer","data":"UHynSnaxvtj5yJ69clpARRK1lYS49I+7NSasrJ5egmI="}}
918320677031	pre-key	48	{"private":{"type":"Buffer","data":"mFEKBrFq+GVg8fNRUFl8Qj1yGUf/BTe2jEQCYKnGMGo="},"public":{"type":"Buffer","data":"X+DcFT8EiBHzKS2d8EMvwqbNJCwNF2+BR/5RBXgT5wk="}}
918320677031	pre-key	52	{"private":{"type":"Buffer","data":"KE0NVMzfgk/9SZEfGVi3kF5cwJZwZy7kvq4myb1BAE8="},"public":{"type":"Buffer","data":"thby3ToYkYi9LUP9dRacUOMkjChWSrNKp0W5Z90NESA="}}
918320677031	pre-key	57	{"private":{"type":"Buffer","data":"2D4uaHIhGU98EZF7rUvJqUR/yWF04i8KWDmp1gbfKGw="},"public":{"type":"Buffer","data":"/nHbaJ2uMxkNIwAsMk6JcfrtoSRZY3BUVD8up7gWDxY="}}
918320677031	pre-key	60	{"private":{"type":"Buffer","data":"4AM6xPW3y7WPJHYHbqE4xUzugtP69XY4VU+pER6QFFU="},"public":{"type":"Buffer","data":"/r80RgJsH+zlrgISacVzO4RgImVX7TyzzOBkdfu1byw="}}
918320677031	app-state-sync-key	AAAAAKQR	{"keyData":"JLElcV1GxAaGMlghWmMdbeHKZQmOl0zdmAuR5HaieBc=","fingerprint":{"rawId":2022896382,"currentIndex":9,"deviceIndexes":[0,2,3,8]},"timestamp":"0"}
918320677031	app-state-sync-key	AAAAAKQO	{"keyData":"9SVbxIFw84Qq/P4SFFfV7zVXLpBGQ6iuCc7x2MphKGc=","fingerprint":{"rawId":2022896382,"currentIndex":7,"deviceIndexes":[0,1,2,3,7]},"timestamp":"0"}
918320677031	app-state-sync-key	AAAAAKQT	{"keyData":"2m54AS+QtZBGCIx38FrcsSFki4UmDGQ8N78igt25raM=","fingerprint":{"rawId":2022896382,"currentIndex":11,"deviceIndexes":[0,2,8,10]},"timestamp":"0"}
918320677031	session	72224237207748.0	{"_sessions":{"Baa10P1Tj5HeqithHyZdMfT273d+3lUeQGRCIdHB3RpK":{"registrationId":293388119,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BVjkaX3Y/56CH40oAJp5JJH7OyMEjbvNOLmsy+nWhJEM","privKey":"GKDC5FafCkt5SPmzsEZcCph496ANZIWXKiQlr3r4u38="},"lastRemoteEphemeralKey":"Bem0h3Iv55TGgCiE+wF7/UaEbBxLlUGhehzenphYQHRt","previousCounter":0,"rootKey":"NTL7f8Lx65CGBLFTyGb+Y4j7R4LDUcgPEt+tgdYUv20="},"indexInfo":{"baseKey":"Baa10P1Tj5HeqithHyZdMfT273d+3lUeQGRCIdHB3RpK","baseKeyType":2,"closed":-1,"used":1789551791917,"created":1789551791917,"remoteIdentityKey":"BQQvf1BVei/uXb6goazNVqFRBfxz6K53pkNlccbsWQh7"},"_chains":{"Bem0h3Iv55TGgCiE+wF7/UaEbBxLlUGhehzenphYQHRt":{"chainKey":{"counter":0,"key":"s1jnDxqroEr8aAKMAjK5xT2xD5ORqqyC54olOm1jyDU="},"chainType":2,"messageKeys":{}},"BVjkaX3Y/56CH40oAJp5JJH7OyMEjbvNOLmsy+nWhJEM":{"chainKey":{"counter":-1,"key":"1U/+CHzGms7BkP/9fLWr/5CWz1J8buwtA/IS01t7KFs="},"chainType":1,"messageKeys":{}}}}},"version":"v1"}
918866813729	session	78048313508077.5	{"_sessions":{"BdOayLNWF3lG7qwAZSXg9U7DXtkpb4qz8thHeHXe25Nm":{"registrationId":0,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"Be2v84c8NrNESgfTuXgbWuS+hbDzBR05wywFAYzi8ZtW","privKey":"uIqzuZ3pQPtfjRxG79tzjABgQ/NZIjgUVr9WvrJbUmM="},"lastRemoteEphemeralKey":"BehWz5m/EvWG1yjRV6EAEiafGcYduKr7uBJmyTljBrAY","previousCounter":0,"rootKey":"FbeDcHTJhHSQfXq5lDuRkK8GWM2ZrpJBa/1xlYNSx/U="},"indexInfo":{"baseKey":"BdOayLNWF3lG7qwAZSXg9U7DXtkpb4qz8thHeHXe25Nm","baseKeyType":2,"closed":-1,"used":1789543514192,"created":1789543514192,"remoteIdentityKey":"BR/hP9G7mbuG0DELMk2Pz+OeiQakjHdNnvpCoqf6Zwtt"},"_chains":{"BehWz5m/EvWG1yjRV6EAEiafGcYduKr7uBJmyTljBrAY":{"chainKey":{"counter":1,"key":"84a8+VrzFbMmKN5+YhuTiOKzzZl5Ybzm9jnIRDVWGdE="},"chainType":2,"messageKeys":{}},"Be2v84c8NrNESgfTuXgbWuS+hbDzBR05wywFAYzi8ZtW":{"chainKey":{"counter":-1,"key":"0k0mDqeJSHnR3Pq8ez3ISZHx7SBpClEVsK19Qt9E80Q="},"chainType":1,"messageKeys":{}}}}},"version":"v1"}
918320677031	sender-key	status@broadcast::72224237207748::0	{"type":"Buffer","data":"W3sic2VuZGVyS2V5SWQiOjE3MjU0NjM4NzUsInNlbmRlckNoYWluS2V5Ijp7Iml0ZXJhdGlvbiI6MSwic2VlZCI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6WzU2LDEzNCw0Myw0Niw2MSwyMzksNDQsMTg0LDEyNSwyMzIsMjIyLDgzLDk4LDIwNywxMzcsOTMsMjA1LDE2MSw4NCwyNDgsMTM2LDIxMywxMzgsOTUsMTkwLDIyMiwxOTQsMTUwLDMsMzYsNzQsNTddfX0sInNlbmRlclNpZ25pbmdLZXkiOnsicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjpbNSw1OSwxOTYsMjIyLDY4LDEyMCwyMTYsMjI5LDExMSwxMjYsMjQwLDIzOSwxNzUsMjE5LDE1MCwxMyw1OCwxOTAsNzAsMTk2LDI4LDc5LDEsMTQyLDQxLDEyMSwxODcsMjA3LDI0MSw0OSwxMywxNTEsNDFdfX0sInNlbmRlck1lc3NhZ2VLZXlzIjpbXX1d"}
918320677031	session	36503010996339.0	{"_sessions":{"BSE0MOybXkVisMmh3kLtcP3HnPY/X7pvvhGhf62iqzJv":{"registrationId":678873839,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BVcmosxf7aRmpmcwn6tdNhsHeGLQoUGu9/uXoZ1S7jBH","privKey":"0C3Pa/2ag3M7db4Gsa0R/mrhMz01Y6ei1SU/Lp6PZWw="},"lastRemoteEphemeralKey":"BWnJOg1Ped9oK5GR9OiwGZnuzJoaGrdzK5hLikCVc/oI","previousCounter":0,"rootKey":"VFUYJaTD+PaXuOtTrDJpIaxhpc5SDfoXvWAADFIjrQQ="},"indexInfo":{"baseKey":"BSE0MOybXkVisMmh3kLtcP3HnPY/X7pvvhGhf62iqzJv","baseKeyType":2,"closed":-1,"used":1789551848748,"created":1789551848748,"remoteIdentityKey":"BTlWVh5djVMma9khJBVeVT+JJivWllmob/db4J0NjkIE"},"_chains":{"BWnJOg1Ped9oK5GR9OiwGZnuzJoaGrdzK5hLikCVc/oI":{"chainKey":{"counter":0,"key":"8dlEdptRG6EZQL/Ny+LFOUuQIpdrX/WHY78b1RCIvh4="},"chainType":2,"messageKeys":{}},"BVcmosxf7aRmpmcwn6tdNhsHeGLQoUGu9/uXoZ1S7jBH":{"chainKey":{"counter":-1,"key":"1Uf3TKyeNlBvIMVhvKVHWJxdEasz/ZcWGiyxUzqFEGk="},"chainType":1,"messageKeys":{}}}}},"version":"v1"}
918320677031	session	149121482625071.0	{"_sessions":{"BbHvbXy92FJ0+t9bjatxyfuMZFXAz574mEW0Nk3pzqda":{"registrationId":1711776590,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BUg0WXpLz4T6sMQoqphsaMbgnO9Ewdui/Yx+6TJ7cwEW","privKey":"MHBK0dVlLPGyNL7oBHgLPwA0xz4Xgqt0g5AQi33VKG8="},"lastRemoteEphemeralKey":"BW9gy+/JlJIvjAOO0YobDlS4JwMx6m+VwKLsD8qxWRci","previousCounter":0,"rootKey":"BL3BsPS/yOeu0fgkCPNLd2e05YOI8Jeo3vGg2G3EmOs="},"indexInfo":{"baseKey":"BbHvbXy92FJ0+t9bjatxyfuMZFXAz574mEW0Nk3pzqda","baseKeyType":2,"closed":-1,"used":1789551883944,"created":1789551883944,"remoteIdentityKey":"BZ+9rL9czHscbH3odvjT/gx9B5v1NMhGlArLg9yM7jxj"},"_chains":{"BW9gy+/JlJIvjAOO0YobDlS4JwMx6m+VwKLsD8qxWRci":{"chainKey":{"counter":0,"key":"Cx69A/EbdUxEYqg6p/Dbbpse/HcmD4r2pTkMcVS9ms0="},"chainType":2,"messageKeys":{}},"BUg0WXpLz4T6sMQoqphsaMbgnO9Ewdui/Yx+6TJ7cwEW":{"chainKey":{"counter":-1,"key":"QiiTGgJ2+S+CXKIDrc+L5CyJkd/RqSjDuoanHTKvyxk="},"chainType":1,"messageKeys":{}}}}},"version":"v1"}
918320677031	pre-key	35	{"private":{"type":"Buffer","data":"yGkLM8ycZI5+ETYbiUnEbG453dc++sA+K0tQwm6L+EM="},"public":{"type":"Buffer","data":"GbS6uaa8zVIeStu8jbMlUGZAO4mZ0SFdXT1mPZmIzCA="}}
918320677031	pre-key	45	{"private":{"type":"Buffer","data":"6M8qD6/9Wmy7gsiadY6PeEdUOWhp2lw3XewdbkmI+Hw="},"public":{"type":"Buffer","data":"1uFjgD0ta5hwehRT+16iRrraoY3LP0fLXrMJbRmQdDA="}}
918320677031	pre-key	50	{"private":{"type":"Buffer","data":"sAnPM5q4RFwLtA0mwevTYPWyblmFI7tgcNa8hKsUoGA="},"public":{"type":"Buffer","data":"mLThhNnsAKIVV5da6dlvXSr37yocFgQAwFJIqQkHMX4="}}
918320677031	pre-key	54	{"private":{"type":"Buffer","data":"uE0oL6uj3DsdIvWboZDkUhZjBrLhaavXDcbpirihkWk="},"public":{"type":"Buffer","data":"5H+hRHuiQWVsKXixT7QywXMCDsMDmeZJ2Kq0za46AU0="}}
918320677031	sender-key	status@broadcast::149121482625071::0	{"type":"Buffer","data":"W3sic2VuZGVyS2V5SWQiOjI4OTEwMjY1OSwic2VuZGVyQ2hhaW5LZXkiOnsiaXRlcmF0aW9uIjoyLCJzZWVkIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjpbMjUsOTIsMjAwLDExMywyMzEsMTEsMjM5LDE5MCwxMiwyNTIsOTgsOTMsNzQsMTQ5LDEwOSwxNDgsMjM3LDExOSw1OCwyMjIsNjQsMTA4LDIxMCwyLDAsMjA3LDI0LDEzOCwxNjQsMTksMjIsMTUxXX19LCJzZW5kZXJTaWduaW5nS2V5Ijp7InB1YmxpYyI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6WzUsOTMsMTU1LDE4OSwzNiwxMjUsNDQsMTIzLDEyMiw2OCw3NiwxODIsNDcsMzEsMjIxLDI0MiwyMzAsMTU1LDIzMiwyMTksMjQ2LDk2LDEyOCwyMzgsMTcxLDI0MCwxMTQsMjMxLDEzMSw3MywxNjQsMTA1LDIzXX19LCJzZW5kZXJNZXNzYWdlS2V5cyI6W119XQ=="}
918320677031	pre-key	64	{"private":{"type":"Buffer","data":"wG6flLdpeMHcD7RnJoNz7fCKT3w9aJ5/Q/5tXRr3XkM="},"public":{"type":"Buffer","data":"h/9NyMWRpgRaeRlOcHsufVuj/5RWbsLVFN0CYVZNq0I="}}
918320677031	pre-key	66	{"private":{"type":"Buffer","data":"OD+EkBvfiZ5RBdtgE6THgIzGGgNCJNxwvj5tmvlQbWs="},"public":{"type":"Buffer","data":"9KjuB7jRREZZYIj975iB03YJghd7Mm7gk7haQZr4bis="}}
918320677031	pre-key	71	{"private":{"type":"Buffer","data":"0Fokp7Ym4ZA7vUv3ypKPaFQJ4w9RfV+2tfHvxx44CWI="},"public":{"type":"Buffer","data":"An7uOTaEWq4cKkYO0hYRUnyc9IKYppu6hVjUWQQZR0Y="}}
918320677031	session	239053601558747.0	{"_sessions":{"BcXiHVgypLTC3OHaFbG2xRMER51UrDgg8eSdwIFSnzZ3":{"registrationId":240266860,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BXG44TSoFJAIzbKewxE3YVBVNMs6wibmZOA1Fh8OAoR5","privKey":"qKuPQl3DZeGTSu3NAuXxPfnNgYsIDRZRJbEXHgRIIVQ="},"lastRemoteEphemeralKey":"BTCm4iLv+OsjFEjcooHo0swlcB06tHB9MCXW239JqXML","previousCounter":0,"rootKey":"I+4O82tVEQEeBbZfXW8kCy/tTpKf7Hp3CQIKkkUTIJ8="},"indexInfo":{"baseKey":"BcXiHVgypLTC3OHaFbG2xRMER51UrDgg8eSdwIFSnzZ3","baseKeyType":2,"closed":-1,"used":1789554132524,"created":1789554132524,"remoteIdentityKey":"BTUf8EF4UYvdbqP+MswM3AdVibB1egx+nMeTxnQkpXR4"},"_chains":{"BTCm4iLv+OsjFEjcooHo0swlcB06tHB9MCXW239JqXML":{"chainKey":{"counter":0,"key":"HUKzU39FBcGyLq8zE2bYb+xXlEWBH/yPfUz98omn+Ag="},"chainType":2,"messageKeys":{}},"BXG44TSoFJAIzbKewxE3YVBVNMs6wibmZOA1Fh8OAoR5":{"chainKey":{"counter":-1,"key":"Ayx/+KUTQ3pBx1C2x27aO93Asu4qp8ujvOi3d9SQcKc="},"chainType":1,"messageKeys":{}}}}},"version":"v1"}
918320677031	pre-key	68	{"private":{"type":"Buffer","data":"wEhMWxHeqFywYuFs4GpxIijCZ8+b0Sqsf8g9exWV92M="},"public":{"type":"Buffer","data":"eU/mfDYItE9+l4IvdGjCmWSW1Oe815pLRfQh3PskJ3Y="}}
918320677031	sender-key	status@broadcast::239053601558747::0	{"type":"Buffer","data":"W3sic2VuZGVyS2V5SWQiOjc5ODczNDMxOCwic2VuZGVyQ2hhaW5LZXkiOnsiaXRlcmF0aW9uIjoxLCJzZWVkIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjpbMTUxLDExMiwyMjEsNjUsOTEsMjU0LDEwNSwxMjksMjM3LDEzNywyMjksODAsNzQsNjcsMjIxLDEyMSw1NSwyNCwxMzIsOSw5LDgzLDE2NiwxOTAsODAsMzYsMjEzLDE4MCwyMjgsMTYwLDE4NiwyMzBdfX0sInNlbmRlclNpZ25pbmdLZXkiOnsicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjpbNSwxNDIsMjAsNzEsOSwyMDMsMTcxLDIxMCwxNTUsMTExLDE0MiwxNjMsMjE4LDIwMiwxMzEsMTExLDc4LDE5Miw1LDE4NiwxOTIsMTExLDIwNSwxNjksMjAzLDE0NSwzOSwxMTUsMjA1LDE1Myw4NSwzOCwxNV19fSwic2VuZGVyTWVzc2FnZUtleXMiOltdfV0="}
918320677031	pre-key	73	{"private":{"type":"Buffer","data":"CBoZl1QFccDIWWey+KtDFkKyib4l9hTNrhq1K3f+aX4="},"public":{"type":"Buffer","data":"tADAHbLeXQvkZGFTZG32Uf71He0yNdM1eFaa76AVwyw="}}
918320677031	session	78048313508077.0	{"_sessions":{"BRmahW0wh1r+P1OKriuwpjTn7Z7vLW2EIylM+w5XRswV":{"registrationId":343165355,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BaY/BhHLxkHZHe67kmQ8LMhXR5srHBOVgDZXBM/X9aBR","privKey":"kO++aESQT1uDajTtrnROTd2DrJqJsv+r0TCZ32yZJVI="},"lastRemoteEphemeralKey":"BVldj7HMjubtiGjZHS150pvBtU5D7qRXdr/jZoXyOLhl","previousCounter":0,"rootKey":"5b/YF2sU5mfyPKHQVcADSYhcdSpOx9aJmgVl6iqPnkM="},"indexInfo":{"baseKey":"BRmahW0wh1r+P1OKriuwpjTn7Z7vLW2EIylM+w5XRswV","baseKeyType":2,"closed":-1,"used":1789551967821,"created":1789551967821,"remoteIdentityKey":"BdBKVWaFEafXWZpIfIfjHxHaZskKOxGKg0WOX/OkR2kr"},"_chains":{"BVldj7HMjubtiGjZHS150pvBtU5D7qRXdr/jZoXyOLhl":{"chainKey":{"counter":4,"key":"PCyYNzquJhGhQzVlXC1/BK+no3483+rgtMT1tUA/r70="},"chainType":2,"messageKeys":{}},"BaY/BhHLxkHZHe67kmQ8LMhXR5srHBOVgDZXBM/X9aBR":{"chainKey":{"counter":-1,"key":"RA+OrSB4nphBZSBmAmAh+HGHuF5Tg8XlBrwfUtbLw9E="},"chainType":1,"messageKeys":{}}}}},"version":"v1"}
918320677031	session	50066601541860.0	{"_sessions":{"BWfgt6poUMPV0trbuNXoIAcJNpv351s+iI9f311mkI81":{"registrationId":2144501499,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BTWIq3hpuy8U11YyqXCmT0LjqXn/7zSx4nR/7dzPzvVn","privKey":"OPgi4uxKtFZHDqvRnZ2OwpdJIXP54EJmL2aifgZQLV8="},"lastRemoteEphemeralKey":"BUb1dJprqVpwUSMEYcjZKtIL/CI4P8VRgzGfUuoN/xwq","previousCounter":0,"rootKey":"V1SvlnBTiFmRRtvs5FMXp3Z6CN7aRR82ikfIr00A6BU="},"indexInfo":{"baseKey":"BWfgt6poUMPV0trbuNXoIAcJNpv351s+iI9f311mkI81","baseKeyType":2,"closed":-1,"used":1789553354486,"created":1789553354486,"remoteIdentityKey":"BahOD/9u+u6uECXTEQA7tcca5LRX8tBwPo6nQ/e635tN"},"_chains":{"BUb1dJprqVpwUSMEYcjZKtIL/CI4P8VRgzGfUuoN/xwq":{"chainKey":{"counter":1,"key":"6eObX0frrkq+Xan6QFYDp12o6kqA59JcgXMui7aZvzQ="},"chainType":2,"messageKeys":{}},"BTWIq3hpuy8U11YyqXCmT0LjqXn/7zSx4nR/7dzPzvVn":{"chainKey":{"counter":-1,"key":"xFoiQKu+7p7dzCwPF0bBPBX4Ls8Ey9KSd4C60kBJDYc="},"chainType":1,"messageKeys":{}}}}},"version":"v1"}
918320677031	sender-key	status@broadcast::50066601541860::0	{"type":"Buffer","data":"W3sic2VuZGVyS2V5SWQiOjU2OTQwMDQ5Niwic2VuZGVyQ2hhaW5LZXkiOnsiaXRlcmF0aW9uIjoyLCJzZWVkIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjpbMTMxLDExMywxNjUsMTk2LDE4OCwyMjEsNDYsMjYsNjUsMjQxLDEzMywxMDksMzQsMTY5LDI3LDEzLDE1OSwyOCw3OSwyMjQsMCw2LDc5LDE2OCwyMzksNzMsMTg1LDI0Nyw0MCwxODYsMTYsMTc5XX19LCJzZW5kZXJTaWduaW5nS2V5Ijp7InB1YmxpYyI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6WzUsODMsMjI0LDE3MCwxODMsMjQ1LDEzLDIzMiwxNzQsMTE3LDIzMCwxNzYsMjI5LDk5LDQzLDIyLDE4OCwzOSwxMzQsMjQxLDg2LDIwLDIxMiwyMzksNzgsMTc1LDI0OSwxMzUsNTUsNzAsMTQ0LDEzNSwzOF19fSwic2VuZGVyTWVzc2FnZUtleXMiOltdfSx7InNlbmRlcktleUlkIjoxNDgyNTE0MDA3LCJzZW5kZXJDaGFpbktleSI6eyJpdGVyYXRpb24iOjEsInNlZWQiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOls0NiwyMTIsMTIxLDM4LDEwNCwxOTUsMjUzLDQzLDYzLDE4OSwxMjksNjIsMjM0LDkxLDE0OSw4NSwxNDAsNzcsMjcsMTI2LDI0Nyw2LDI1MywyMTYsMTMwLDExMywzMSw0OSwxNDIsMjQ4LDIwNiwyNl19fSwic2VuZGVyU2lnbmluZ0tleSI6eyJwdWJsaWMiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOls1LDczLDI0NiwxOTEsMjQ0LDkyLDI4LDY3LDEyNSwxOTMsOTUsMTE5LDU5LDI0NCwxOTgsMTgxLDE0LDQxLDIyNywxMiwxNTIsNDQsMTgyLDE4OSwxNjQsMTgzLDEwMywxNTYsMTE4LDE5NiwxODMsNDIsMTA2XX19LCJzZW5kZXJNZXNzYWdlS2V5cyI6W119XQ=="}
918320677031	pre-key	76	{"private":{"type":"Buffer","data":"0G5pHjR60QIpNFO/49C/yg8A0hIwWf+Qsk9yULCsfkU="},"public":{"type":"Buffer","data":"ltFoLScXHskl5d+Q6KP5OOvzGt8Vkz7GHADuAG4iZEQ="}}
918320677031	pre-key	78	{"private":{"type":"Buffer","data":"SB/a5zY3IXegL+UnY7lrX3mD1e3YSBGTUwVrHUbjR3I="},"public":{"type":"Buffer","data":"O79tSE2/9Y0h/aAAHYrq8NOlij9pjYIpmLeJ2ZztzAM="}}
918320677031	pre-key	81	{"private":{"type":"Buffer","data":"AMSFKDjJ6hCQiZ2Ig9Fnmubj/9SYMuhTGfxKlaGlbHo="},"public":{"type":"Buffer","data":"Ag1oSlS78Tb/+zfvyhx7IpVI5QwBzDjNYHSs7f0uQGo="}}
918320677031	pre-key	82	{"private":{"type":"Buffer","data":"WG2xN9au2rTHr7es1A0/XOJPGOctF3NlPD7TzKqmXEw="},"public":{"type":"Buffer","data":"8ideXDVVnGYkWO5oHFRlS7jsBggmeB5BGe9inPOZOHM="}}
918320677031	pre-key	85	{"private":{"type":"Buffer","data":"yNW8WNDJMtUS/JMI0zgtj0ZozsOQ55bUh+MW5d5U92Q="},"public":{"type":"Buffer","data":"8n+RS7HcpGBJN5cfZu7kfesNKax9NquOiOIcln5Gu1k="}}
918320677031	pre-key	88	{"private":{"type":"Buffer","data":"SN/Ve28oezEbD1KnjnPKeeCLMZtHnIZP5BGEoEh5+X0="},"public":{"type":"Buffer","data":"fCR6gQz9j+6D4s2wOrXo7orVCZ9Tw6JWKyZKaJhwQ14="}}
918320677031	pre-key	89	{"private":{"type":"Buffer","data":"eL6m9JXUACep0lSJ1puJSWi62EhlFZAqFP+oZxjbQVI="},"public":{"type":"Buffer","data":"uwOi0T+svDornYa7kmx5fQ7Rs2tIcwQHJJdKOCTRfFY="}}
918320677031	session	78048313508077.6	{"_sessions":{"BdPQdiB/4suKxxnswM3RLpUFwmMXMMBKvyzviPTdPGcf":{"registrationId":419,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BQ1XeKjNLGhRi9XQ+YqKNk7yX3O63D050rQXi9Sol1wE","privKey":"2N8nS9p9mOs58MGSwBQT6nbOO/Qx6CVcocLAurWWo3s="},"lastRemoteEphemeralKey":"BVS+Sn1c2/byzbCdXQFnFaHXHasSKY/KL3eEqEG/iGFP","previousCounter":0,"rootKey":"9aJHaFUjsJq4vytyWjfjPWq/6asUEdjr16q1N7N892A="},"indexInfo":{"baseKey":"BdPQdiB/4suKxxnswM3RLpUFwmMXMMBKvyzviPTdPGcf","baseKeyType":2,"closed":-1,"used":1789554334079,"created":1789554334079,"remoteIdentityKey":"BearWZF3i2KyEbBn8BRvI1nj21UaRtyZqnPHIZkZnh4h"},"_chains":{"BVS+Sn1c2/byzbCdXQFnFaHXHasSKY/KL3eEqEG/iGFP":{"chainKey":{"counter":1,"key":"pE0bXPzTtxDARQ1rdGqKiCJUsmDU9zBlt91bMkGiiAs="},"chainType":2,"messageKeys":{}},"BQ1XeKjNLGhRi9XQ+YqKNk7yX3O63D050rQXi9Sol1wE":{"chainKey":{"counter":-1,"key":"rSmYR5IJRfGmapJOHhpywg5r1EHwGuQ4jYR90d1eD8M="},"chainType":1,"messageKeys":{}}}}},"version":"v1"}
918320677031	creds	base	{"noiseKey":{"private":{"type":"Buffer","data":"iPx2kCZ1U6otO5H1iEQ1vGk3WPdJ5M85FR28GGPMtUY="},"public":{"type":"Buffer","data":"t6mGv8Mirz8JXK+7i4xCDfc1dSS29/v1hmw/EpxbtA8="}},"pairingEphemeralKeyPair":{"private":{"type":"Buffer","data":"UNRuVjg2o2c7lwBdWKbuPkDVTNBtb02qXYvjCUb5YlY="},"public":{"type":"Buffer","data":"fwyGKwB1JXo6LO9QYFjAnmK7eNussVMS4LEObAuuuTc="}},"signedIdentityKey":{"private":{"type":"Buffer","data":"wNrMZTdvk4qtZVPwOidCHYyzH+D51VqXfJnRpgxAqE4="},"public":{"type":"Buffer","data":"/wWNXE2f2c8h1xsc6jTh2KWEs3MTB9hiRU38EOte+AI="}},"signedPreKey":{"keyPair":{"private":{"type":"Buffer","data":"2H/P9omoKmr/pZvixie8IHA1wLGNxBB/rQ3FxMfyTW0="},"public":{"type":"Buffer","data":"+5YDdF5EL97HFuEhzuKd0wz/Jrwi8Fy8wxuZebRsAgM="}},"signature":{"type":"Buffer","data":"xSNshVIL+wKlNPsQdSmA08eWoSNo/K1L/ecKX1yS3f+KHfg9Y7hxkzKpJ+ONEuxVXwzIm/GbD/pxHN0+5pqhiQ=="},"keyId":1},"registrationId":41,"advSecretKey":"6UKYTjMzoVmsCchlSAZ2y+BoGSHbnJyZH69e4QIBGg8=","processedHistoryMessages":[],"nextPreKeyId":92,"firstUnuploadedPreKeyId":92,"accountSyncCounter":0,"accountSettings":{"unarchiveChats":false},"registered":true,"pairingCode":"WESZPXKS","me":{"id":"918320677031:7@s.whatsapp.net","lid":"78048313508077:7@lid","name":"NXC Controls"},"account":{"details":"CP7ly8QHEKO/qdUGGBAgACgA","accountSignatureKey":"0EpVZoURp9dZmkh8h+MfEdpmyQo7EYqDRY5f86RHaSs=","accountSignature":"8JGrvJev7gwrOL44sCt6U1u4aDZA8lHe2dDvmLQHGN3072Wkr/dVMPW02vNMZGczk3LmTAhnc8yMcd+PYSGoBw==","deviceSignature":"iYeG6mIPZmySKHXHgQVQjIx8WpyyRENQTtCL3wj8AM+5x0Iak6cGo5gISMnP7LjwPZH0vQeEuse/yulUoJE7jw=="},"signalIdentities":[{"identifier":{"name":"918320677031:7@s.whatsapp.net","deviceId":0},"identifierKey":{"type":"Buffer","data":"BdBKVWaFEafXWZpIfIfjHxHaZskKOxGKg0WOX/OkR2kr"}}],"platform":"android","routingInfo":{"type":"Buffer","data":"CA0IEggF"},"lastAccountSyncTimestamp":1789553118,"myAppStateKeyId":"AAAAAKQY"}
918320677031	pre-key	63	{"private":{"type":"Buffer","data":"sGLYhLtFjOdKRcJQmvyeRkzjkyT6OLZ1kMqejgAYFGA="},"public":{"type":"Buffer","data":"4e34rElcaovEtcHLdpjJLMl9T6Ky+Egfn4QQV2N1+Ag="}}
918320677031	pre-key	65	{"private":{"type":"Buffer","data":"uEiXGZE2htBC1dZXqbSpTLr7TYoQXRDHGyyuiwci63M="},"public":{"type":"Buffer","data":"yizlPspi0p+5A6z9QdnAa7hm0n2+x++Q/OufxvZGYg8="}}
918320677031	pre-key	67	{"private":{"type":"Buffer","data":"GDWBrT8r3FJlFvALGRNjp13MZD+Baq5DTF7DNzC8BXc="},"public":{"type":"Buffer","data":"Wu1Ou1GkNuHcfchbFtot6xSfPB1Y1bY037JHbpzNO08="}}
918320677031	pre-key	72	{"private":{"type":"Buffer","data":"sFGV9HdOUkR6yCCpk51QBB2ulmBQzSQVbePRuBvI12I="},"public":{"type":"Buffer","data":"+jrfUUMbAE7Jl6vd8GfaRGL/77kV/6PaDPbJwMFg9lw="}}
918320677031	pre-key	77	{"private":{"type":"Buffer","data":"QEZEUiC0h2DE0m6P7xaUfTyivNz1Q1O0DAPGtS/PGF8="},"public":{"type":"Buffer","data":"K7Q0k+1EOCrSNUZY3BfUH1FVOx5nKl9RQUIZmXU0TkU="}}
918320677031	pre-key	84	{"private":{"type":"Buffer","data":"CAuZg4BmZ+BiiBT39unsrED7aGJ1iqnKBjlxqQf93V4="},"public":{"type":"Buffer","data":"U2YPDhBvN/SxmhKFPaBbqllhry6Rk4npC1N7Bt8xckc="}}
918320677031	pre-key	90	{"private":{"type":"Buffer","data":"8Asp+z0/kbCbP9xtZfyw6tg8yST1wfDGfhyBAZAkH3U="},"public":{"type":"Buffer","data":"X+jcBI2OOgTvillY/KnHqcG8CMhHwPXyeSpwBueugAE="}}
918320677031	session	208211793723534.0	{"_sessions":{"BSGCT2+ljYAMun6Z539hE4lEzLkR7rbM39YY1dqiIFkd":{"registrationId":1362822416,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BUSrRUx+59B6hxzgU2D5bPY1aRDKNuKjsPEAqqQaD2Fu","privKey":"sLKaQKv3AjLzhuRV/0bM/q76z17S/JYO5yvZUVfDekk="},"lastRemoteEphemeralKey":"BaxwbDLfumDety/jjex9eUEeEM8TQCnCG3Ez0K2akqAu","previousCounter":0,"rootKey":"KYaKY7rca2rePL2y9zPZVLuvxRBJ/Zi5XhPSm8gWG84="},"indexInfo":{"baseKey":"BSGCT2+ljYAMun6Z539hE4lEzLkR7rbM39YY1dqiIFkd","baseKeyType":2,"closed":-1,"used":1789556109942,"created":1789556109942,"remoteIdentityKey":"BZjWVTx3FHdblkFO7l2V5F2wojNn06tJarQxwkvSxRxM"},"_chains":{"BaxwbDLfumDety/jjex9eUEeEM8TQCnCG3Ez0K2akqAu":{"chainKey":{"counter":0,"key":"AlWDhpSQmyW4eCtnSPC/PJZ9E+GZmiLAZtkh2K3IAuc="},"chainType":2,"messageKeys":{}},"BUSrRUx+59B6hxzgU2D5bPY1aRDKNuKjsPEAqqQaD2Fu":{"chainKey":{"counter":-1,"key":"FXdwvoRfUVY9ULIrZbM/Xt6iadYemh22eg3vhRfcCM4="},"chainType":1,"messageKeys":{}}}}},"version":"v1"}
918320677031	sender-key	status@broadcast::208211793723534::0	{"type":"Buffer","data":"W3sic2VuZGVyS2V5SWQiOjIwMDQyNDUwMzUsInNlbmRlckNoYWluS2V5Ijp7Iml0ZXJhdGlvbiI6MSwic2VlZCI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6WzE3MSwxMzgsMTIyLDEwMiwxNTgsMTMwLDE5MSwyNDgsMjAzLDE2MywxNTIsMjI1LDE2NiwyMjYsODMsMSw1MywxOTUsMTgxLDIyOSw2MSw2NCw5MSwxMTksOTcsMTcyLDIxLDE3MCw2Nyw5LDE5NSw4XX19LCJzZW5kZXJTaWduaW5nS2V5Ijp7InB1YmxpYyI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6WzUsODQsMTk4LDIyNiwxNzQsMTQsNTksMjQ5LDIyLDEyMiwxNzgsMTg5LDIwNywyMjAsMTI5LDEwNiwyMDgsMTg5LDQxLDIwNywxOTksMjEwLDYsMTQ1LDE1MywxODMsMjMwLDIxNiw1NCw4MSwyNTQsMjE1LDg3XX19LCJzZW5kZXJNZXNzYWdlS2V5cyI6W119XQ=="}
\.


--
-- Data for Name: Stats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Stats" (id, "totalMessagesSent") FROM stdin;
1	9
\.


--
-- Data for Name: SubscriptionHistory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SubscriptionHistory" (id, "userNumber", "userName", "planName", days, price, "paymentMethod", "startDate", "expiryDate", "createdAt", "updatedAt") FROM stdin;
1	918866813729	Robinson Macwan	Starter Plan	30	299	Direct	2026-09-15 16:14:30.289+05:30	2026-10-15 16:14:30.289+05:30	2026-09-15 16:14:30.29+05:30	2026-09-15 16:14:30.291+05:30
2	918866813729	Robinson Macwan	Starter Plan	30	299	Direct	2026-09-15 16:14:48.342+05:30	2026-10-15 16:14:48.342+05:30	2026-09-15 16:14:48.343+05:30	2026-09-15 16:14:48.343+05:30
\.


--
-- Data for Name: Templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Templates" (id, "userNumber", keyword, type, content, buttons, footer, header, sections, "mediaUrl", "fileName", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Tokens" (id, token, number, "userType") FROM stdin;
1	493d570fb519634812221c598a21ac0171e84270c0920029	918866813729	user
2	2175112753214b879053c57de1fedc2e126248a584a1e2ee	918866813729	user
4	f88232f9e45d92979cc55d7041c4524b1b6c0cad9df2d324	918866813729	user
5	36ddcc2f99bbebc5a494db800b79d4887ca17df855c67a66	919999999999	admin
6	7687095c17c7a10395eca5036c4c386095d0556c92fda289	919999999999	admin
7	3cca649f22d14903352c2fd2aa1046585ce354862b5547ca	919999999999	admin
8	874ef20c1e0cee00b0ea159ab687183430a3d79665a7a925	919999999999	admin
9	9f99081b4e35065dd08f1a330d42e5c50326b33f5feea82d	918866813729	user
10	c3df84c210c98004eba35a6284573e7f77f38f38a31ebd29	919999999999	admin
11	cb14e62a0f3624948d801eb6a07ebb164b9a13c9e43abee5	918866813729	user
12	7656c140c69777e2bddaf0df218332d3ca205c76916c56ae	919999999999	admin
16	0a61ecca45c832d5c0646f1784d17b0c42802d084526322d	919999999999	admin
20	8c045eae9413eb8aeaa8a961001f2efe5472d9fdab3b6afc	918866813729	user
21	cd5aa0c6c9a54d936e9249677c6be138fc9e5bf84d3b936f	919999999999	admin
22	5d5d0ed870fa0bd5eacde256345ce3801b3fe6fe113e6701	918866813729	user
23	024c4e43d8d65740e1d186f8ae0e3c620f7cc985b61cf33b	919999999999	admin
24	8ff18d5d12c85ec25d1d55c2be4286332bd6c9d9279abdcb	918866813729	user
25	44ed9120c1857a0ad34990755604ccc673f2fe44c7fa11c8	918866813729	user
26	60c1a249649c56ed5c120ffb1811c30f5d0c72b2b48d5071	918866813729	user
27	2e3d6a7406c63c337f9944108de54d390bbc9da73032d9d9	918866813729	user
28	94a84eb2d6090461b9fd3de70ffce615129b63e30aad3027	918866813729	user
29	2dffc5f5a51e723d596ed8f9bfedcc7f30e4aecae20d2664	918866813729	user
30	6f7fa9147a0e87b5c8ac8ff39c88cc8b64b31ca7bc3e6c72	918866813729	user
31	ff56c40aa81a70c08cbc92eab82f7381db876916c01dd97d	918866813729	user
32	2f1a98e483ba7d65c344d0b2bfdcb96db36f80cb16aefc2e	918866813729	user
33	b37eabf2e7fbd14301509ab747d3956d088f4399d09dc115	918866813729	user
34	1d89ddc73c263f8ad8f6f4227c293f5b8236ac69c36cc76b	918866813729	user
35	e1c879c61ea57568392e929ef6b7ec33458b48360d52160c	918866813729	user
36	dc16d23ef907884a6cfd217c1ea1047c8728de7b1306dc9e	918866813729	user
37	bbd9bb15226fc476bbe99c2feae0db4f8bcb6d7872bb4c48	918866813729	user
38	c678db663c5b99aee7352134b2b79336f00d73336b2cb080	918866813729	user
39	0fe7a1cec57aed69752a9c43d3ec1bda2eae3dd8bd4bc1cb	918866813729	user
40	73635e4f2c88af1a0471f5a0c14250f3390d0cb7f6ec4026	918866813729	user
41	b6c4a31f02039fed45db739c0489c8e609ecdea305b6f3a2	918866813729	user
42	519f85f57cbf7669fc99366b180a507249ba2e5172591e20	918866813729	user
43	dddc6bb1a66bff111a6ccf09a1d980fd0c0418a792bed434	918866813729	user
44	84bdeae16e0d9647dab5e78c7ca98a2aa2aa98c239d2b853	918866813729	user
45	05b6a58028cf76ffdd62531b6123fa3763c55ecf3a2898a8	918866813729	user
46	ef13bc41d0a9565721becc080e696e6642be7fb5710a016e	918866813729	user
47	094564b56e306a658095f905316f4a2d44df5455bf681717	918866813729	user
48	f369beccf8532aedcac2064e4fe2563507657717b915a5b8	918866813729	user
49	6fdac459bf4923671939dbcbafea86074f1729488c538930	918866813729	user
50	c00f73232eb89f58040369489e6e75b724ca3cc16135eb94	918866813729	user
51	d1e0406405f2dc328a2bc7e7812d0a382141239b70f51333	918866813729	user
52	d15c643b11a3cb0b01b03c44a2b152f9f966677778932d3e	918866813729	user
53	ce697f26f317520146fa994f35669714af4050ae4307213f	918866813729	user
54	49f20411d9d2f8e46b4d5e6a557d147e8693518cbd0f3b0d	918866813729	user
55	8e6ec5a972ccb52afc74e26fde79aa5922afd6982c64fffd	918866813729	user
56	6f6a4619ad23791ae335b2b1bfb42dee155568fb09b7f0cb	918866813729	user
57	53cf3a2e1233202f9a49ece3c8940ec2ede1034893bf01ee	918866813729	user
58	670c93acc53aeae57d1280a5c74940908d81e9f131f4ca2c	918866813729	user
59	b4a19acb4256f220bfafa4b6792f3fed945caf3f4b62a987	918866813729	user
60	25638dcdf9df372dc0ea11cad26bb8bb73d8cd09637c3401	918866813729	user
61	4355dd170984545e6986c62038ac8284aa3a24a1e034c58a	918866813729	user
62	d8f1dd6b19a8c02b385ee148070e1ee25309298daf3f60b6	918866813729	user
63	4e7bf92128c661b029e057fb1d2b336d6d84313d155401df	918866813729	user
64	8803f1bce11cc59ca7779213677ca74e33e53815051435bd	918866813729	user
65	e6b96c7b7599b6769c2f2fb2c39cccc39f53aa998c9d4a56	918866813729	user
66	ea2be1df5ecf4eb31268d11cd34099d052ce61492d7d876d	918866813729	user
67	737f4011bdef05ebcf293d0308d3f34e608f007ca7285721	918866813729	user
68	44b64af42215f2b9e5c5fb3abf03a21892482dc84c2a681a	918866813729	user
69	dd1a8b70069a90fcafecd5837398e67a6aa4a1237e5fa185	918866813729	user
70	5e6a8517fb7f79bc75ca99d37a22926eb982ce9a01c59d3c	918866813729	user
71	fa3a7c2cdf16024c4f304ba25fd6a94bc03c49b14f770856	918866813729	user
72	01b952ba96384b228c1155306bcbafd8a6ebb7382bcfdb06	918866813729	user
73	67e2ad3ed11794f6814d205083e7a5ca38e55fe17ca83f9c	919999999999	admin
74	4c4789c4842d514fb3a26d345565143db5294eb6fb736b09	918866813729	user
\.


--
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Users" (id, number, name, gender, password, "userType", "validDays", "isActive", "webhookUrl", "createdAt", "updatedAt", "deletedAt") FROM stdin;
2	919999999999	Default Admin	Other	admin123	admin	365	t	\N	2026-09-15 13:59:43.877+05:30	2026-09-15 14:16:19.417+05:30	\N
1	918866813729	Robinson Macwan	Male	Test@123	user	60	t	\N	2026-09-15 10:54:34.841+05:30	2026-09-15 16:14:48.337+05:30	\N
\.


--
-- Data for Name: WabaAutomations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WabaAutomations" (id, "userNumber", "triggerKeyword", "responseType", "messageText", "templateName", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: WabaCampaigns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WabaCampaigns" (id, "userNumber", name, "templateName", numbers, "scheduledTime", status, "sentCount", "failedCount", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: WabaDevices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WabaDevices" (id, "userNumber", phone, "phoneNumberId", "wabaAccountId", "accessToken", status, "qualityRating", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: WabaFlows; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WabaFlows" (id, "userNumber", name, "triggerKeyword", "flowData", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: WabaTemplates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WabaTemplates" (id, "userNumber", name, language, category, status, components, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: Campaigns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Campaigns_id_seq"', 1, false);


--
-- Name: ChatFlows_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ChatFlows_id_seq"', 1, false);


--
-- Name: ChatSessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ChatSessions_id_seq"', 1, false);


--
-- Name: MessageLogs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."MessageLogs_id_seq"', 14, true);


--
-- Name: Plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Plans_id_seq"', 3, true);


--
-- Name: QueuedMessages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."QueuedMessages_id_seq"', 1, false);


--
-- Name: ScheduledMessages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ScheduledMessages_id_seq"', 1, true);


--
-- Name: Stats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Stats_id_seq"', 1, false);


--
-- Name: SubscriptionHistory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."SubscriptionHistory_id_seq"', 2, true);


--
-- Name: Templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Templates_id_seq"', 1, false);


--
-- Name: Tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Tokens_id_seq"', 74, true);


--
-- Name: Users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Users_id_seq"', 2, true);


--
-- Name: WabaAutomations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."WabaAutomations_id_seq"', 1, false);


--
-- Name: WabaCampaigns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."WabaCampaigns_id_seq"', 1, false);


--
-- Name: WabaDevices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."WabaDevices_id_seq"', 1, false);


--
-- Name: WabaFlows_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."WabaFlows_id_seq"', 1, false);


--
-- Name: WabaTemplates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."WabaTemplates_id_seq"', 1, false);


--
-- Name: Campaigns Campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Campaigns"
    ADD CONSTRAINT "Campaigns_pkey" PRIMARY KEY (id);


--
-- Name: ChatFlows ChatFlows_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatFlows"
    ADD CONSTRAINT "ChatFlows_pkey" PRIMARY KEY (id);


--
-- Name: ChatSessions ChatSessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatSessions"
    ADD CONSTRAINT "ChatSessions_pkey" PRIMARY KEY (id);


--
-- Name: MessageLogs MessageLogs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MessageLogs"
    ADD CONSTRAINT "MessageLogs_pkey" PRIMARY KEY (id);


--
-- Name: Plans Plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_pkey" PRIMARY KEY (id);


--
-- Name: Plans Plans_planId_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key1" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key10" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key11; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key11" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key12; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key12" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key13; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key13" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key14; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key14" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key15; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key15" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key16; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key16" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key17; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key17" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key18; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key18" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key19; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key19" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key2" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key20; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key20" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key21; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key21" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key22" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key23; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key23" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key24; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key24" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key25; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key25" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key26; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key26" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key27; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key27" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key28; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key28" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key29; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key29" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key3" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key30; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key30" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key31; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key31" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key32; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key32" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key33; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key33" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key34; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key34" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key35; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key35" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key36; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key36" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key37; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key37" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key38; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key38" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key39; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key39" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key4" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key40; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key40" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key41; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key41" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key42; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key42" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key43; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key43" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key44; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key44" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key45; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key45" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key46; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key46" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key47; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key47" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key48; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key48" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key49; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key49" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key5" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key50; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key50" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key51; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key51" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key52; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key52" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key53; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key53" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key54; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key54" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key55; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key55" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key56; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key56" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key57; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key57" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key58; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key58" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key59; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key59" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key6" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key60; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key60" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key61; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key61" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key62; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key62" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key63; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key63" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key64; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key64" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key65; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key65" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key66; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key66" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key67; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key67" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key68; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key68" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key69; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key69" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key7" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key70; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key70" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key71; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key71" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key72; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key72" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key73; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key73" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key74; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key74" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key75; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key75" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key76; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key76" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key77; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key77" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key78; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key78" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key79; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key79" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key8" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key80; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key80" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key81; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key81" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key82; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key82" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key83; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key83" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key84; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key84" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key85; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key85" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key86; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key86" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key87; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key87" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key88; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key88" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key89; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key89" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key9" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key90; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key90" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key91; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key91" UNIQUE ("planId");


--
-- Name: QueuedMessages QueuedMessages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."QueuedMessages"
    ADD CONSTRAINT "QueuedMessages_pkey" PRIMARY KEY (id);


--
-- Name: ScheduledMessages ScheduledMessages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ScheduledMessages"
    ADD CONSTRAINT "ScheduledMessages_pkey" PRIMARY KEY (id);


--
-- Name: Sessions Sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sessions"
    ADD CONSTRAINT "Sessions_pkey" PRIMARY KEY (phone, "dataType", "dataId");


--
-- Name: Stats Stats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Stats"
    ADD CONSTRAINT "Stats_pkey" PRIMARY KEY (id);


--
-- Name: SubscriptionHistory SubscriptionHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SubscriptionHistory"
    ADD CONSTRAINT "SubscriptionHistory_pkey" PRIMARY KEY (id);


--
-- Name: Templates Templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Templates"
    ADD CONSTRAINT "Templates_pkey" PRIMARY KEY (id);


--
-- Name: Tokens Tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_pkey" PRIMARY KEY (id);


--
-- Name: Tokens Tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key1" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key10" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key11; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key11" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key12; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key12" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key13; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key13" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key14; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key14" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key15; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key15" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key16; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key16" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key17; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key17" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key18; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key18" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key19; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key19" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key2" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key20; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key20" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key21; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key21" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key22" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key23; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key23" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key24; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key24" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key25; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key25" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key26; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key26" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key27; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key27" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key28; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key28" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key29; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key29" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key3" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key30; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key30" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key31; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key31" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key32; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key32" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key33; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key33" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key34; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key34" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key35; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key35" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key36; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key36" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key37; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key37" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key38; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key38" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key39; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key39" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key4" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key40; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key40" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key41; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key41" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key42; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key42" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key43; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key43" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key44; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key44" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key45; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key45" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key46; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key46" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key47; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key47" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key48; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key48" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key49; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key49" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key5" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key50; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key50" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key51; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key51" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key52; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key52" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key53; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key53" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key54; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key54" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key55; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key55" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key56; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key56" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key57; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key57" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key58; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key58" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key59; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key59" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key6" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key60; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key60" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key61; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key61" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key62; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key62" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key63; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key63" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key64; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key64" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key65; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key65" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key66; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key66" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key67; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key67" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key68; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key68" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key69; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key69" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key7" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key70; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key70" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key71; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key71" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key72; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key72" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key73; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key73" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key74; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key74" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key75; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key75" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key76; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key76" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key77; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key77" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key78; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key78" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key79; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key79" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key8" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key80; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key80" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key81; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key81" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key82; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key82" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key83; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key83" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key84; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key84" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key85; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key85" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key86; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key86" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key87; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key87" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key88; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key88" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key89; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key89" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key9" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key90; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key90" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key91; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key91" UNIQUE (token);


--
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (id);


--
-- Name: WabaAutomations WabaAutomations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WabaAutomations"
    ADD CONSTRAINT "WabaAutomations_pkey" PRIMARY KEY (id);


--
-- Name: WabaCampaigns WabaCampaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WabaCampaigns"
    ADD CONSTRAINT "WabaCampaigns_pkey" PRIMARY KEY (id);


--
-- Name: WabaDevices WabaDevices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WabaDevices"
    ADD CONSTRAINT "WabaDevices_pkey" PRIMARY KEY (id);


--
-- Name: WabaFlows WabaFlows_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WabaFlows"
    ADD CONSTRAINT "WabaFlows_pkey" PRIMARY KEY (id);


--
-- Name: WabaTemplates WabaTemplates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WabaTemplates"
    ADD CONSTRAINT "WabaTemplates_pkey" PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict cK64c6xj9xEgruaredvNYdICGikjfJ6mqH1hbTgNCP8GjRjsmxC95AgJy2lg3rx

