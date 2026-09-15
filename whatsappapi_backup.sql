--
-- PostgreSQL database dump
--

\restrict jZDN1w8oAYcUQQ0aWom7vG6TpVHLCh46RAttVYt7Da9vT5tQzgaspzfZwVQhe28

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
\.


--
-- Data for Name: Plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Plans" (id, "planId", name, days, price, "createdAt", "updatedAt") FROM stdin;
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
918866813729	session	918866813729.0	{"_sessions":{"Ba0FhZZt61eFS2dMQYONVXypQPIGGxc34g/K1CFqf6YK":{"registrationId":4274826,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BYe0rivRVVlqrzLILYTARAOxKVXViUI26QMXEN9ZGot4","privKey":"qGp6qCCEjxgmZEs8Mmzd4SqGASo4GgWTNOEXlG9atEs="},"lastRemoteEphemeralKey":"BTzd87VHwDFmrCsm9B01URMn8y9pzqufkfhrEHu/ONY/","previousCounter":1,"rootKey":"9BAhT8j2kOnkTNNWVUOHyAaQHlzqFo/eXm3ujeGcWeY="},"indexInfo":{"baseKey":"Ba0FhZZt61eFS2dMQYONVXypQPIGGxc34g/K1CFqf6YK","baseKeyType":2,"closed":-1,"used":1789453415195,"created":1789449934238,"remoteIdentityKey":"BRFke80F4rUIiCaqpotvT9IkrJfODIl/D33EtZIoKVJH"},"_chains":{"BZms07qiXka6ex1p0Ce4Wv4SsILnIT/mA9qIoMw10Fkl":{"chainKey":{"counter":7},"chainType":2,"messageKeys":{}},"BTzd87VHwDFmrCsm9B01URMn8y9pzqufkfhrEHu/ONY/":{"chainKey":{"counter":0,"key":"ZsRM+ubVEVONXf3LAQa8zJzzAiecoeevhgf/z8BrYYs="},"chainType":2,"messageKeys":{}},"BYe0rivRVVlqrzLILYTARAOxKVXViUI26QMXEN9ZGot4":{"chainKey":{"counter":3,"key":"FiT6iWHtI/hoO7W9zapdXduptGyyeST98dPUSIZHgR8="},"chainType":1,"messageKeys":{}}}}},"version":"v1"}
918866813729	session	918000483847.0	{"_sessions":{"BbCR5ZnlcTp/5QeuxnVGbTTULlcg+Y0D2waY9K9eYad+":{"registrationId":952642004,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BR0uSOURqudQkxVSMdWa6yWAvoOFdCEdz8QxUHexa1xG","privKey":"oOkcAN0VbA73PHULJmXRcwZlVFTWstbW2o7i0NPopHY="},"lastRemoteEphemeralKey":"BeUORCQP/tVWjzVQm6086iT2eNdjPOi63g1Ub560kwYK","previousCounter":0,"rootKey":"F/bSteoYjwmqtqG2PfwEEbHz2Jo2RL0CMTf86lYu3QM="},"indexInfo":{"baseKey":"BbCR5ZnlcTp/5QeuxnVGbTTULlcg+Y0D2waY9K9eYad+","baseKeyType":1,"closed":-1,"used":1789449977991,"created":1789449977991,"remoteIdentityKey":"Bby5SNH+jIE2OtfjC7wStcsoHEWqAVios82IuC4lyE5W"},"_chains":{"BR0uSOURqudQkxVSMdWa6yWAvoOFdCEdz8QxUHexa1xG":{"chainKey":{"counter":4,"key":"JsccqWGWh4rc8vmucG0VPZ39Vc0hX49x/2XKC4FrsyY="},"chainType":1,"messageKeys":{}}},"pendingPreKey":{"signedKeyId":2847746,"baseKey":"BbCR5ZnlcTp/5QeuxnVGbTTULlcg+Y0D2waY9K9eYad+","preKeyId":21167}}},"version":"v1"}
918866813729	session	140836490715296.0	{"_sessions":{"BXwXscgKW/mdT3F3ZN75PFQjW0C4rnAVsIA7Dw2YtD06":{"registrationId":4274826,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BdRYDjMuBogTwyrkoWbkF7rO+YJBfrSf8fVeg+bXlOoF","privKey":"GP/F5NYqhAyRm9xvIZG+o9NveMnU13F9NpWs5nWX3W4="},"lastRemoteEphemeralKey":"BdhkNlSJB+FS6nGj//SIJlisECT/g6lLoHWrmj6X/8QM","previousCounter":0,"rootKey":"Q2G+Up3aBUf39CK8cG82j/jFGi3id2q5GQMpp+pNtgk="},"indexInfo":{"baseKey":"BXwXscgKW/mdT3F3ZN75PFQjW0C4rnAVsIA7Dw2YtD06","baseKeyType":1,"closed":-1,"used":1789454514091,"created":1789454514091,"remoteIdentityKey":"BRFke80F4rUIiCaqpotvT9IkrJfODIl/D33EtZIoKVJH"},"_chains":{"BdRYDjMuBogTwyrkoWbkF7rO+YJBfrSf8fVeg+bXlOoF":{"chainKey":{"counter":7,"key":"JutjGON1Qy1dNwG/UASuxu2VFQXC2KnfuFmbh0sBNZo="},"chainType":1,"messageKeys":{}}},"pendingPreKey":{"signedKeyId":4069836,"baseKey":"BXwXscgKW/mdT3F3ZN75PFQjW0C4rnAVsIA7Dw2YtD06","preKeyId":13344144}}},"version":"v1"}
918866813729	pre-key	1	{"private":{"type":"Buffer","data":"wOR/jVLv3E74jGLOTgezJeeNIoLw9xEtu/TdQSkzgnw="},"public":{"type":"Buffer","data":"w8/1jT5Ro84NAWOB3zQ/SimMq09neblBfCnwK/0tZHQ="}}
918866813729	pre-key	2	{"private":{"type":"Buffer","data":"IHfWIy7S298uRwOKuRJ223jZtGyALGBhndLs97/1Vlo="},"public":{"type":"Buffer","data":"cFZrNEsITF9M0yFqGROZi36Qpa8AdpENkYPw9J0eEmU="}}
918866813729	pre-key	4	{"private":{"type":"Buffer","data":"YMRLmSB2Qckq0hvQn+YBY1MVPPOKUzqMKcCWqmEiRFk="},"public":{"type":"Buffer","data":"uXwww5lB4O82vx/tRfp8Fr8SqFuwIE151po8uOW3nw4="}}
918866813729	pre-key	6	{"private":{"type":"Buffer","data":"IKxMbN1ybtG9T6EQ3sewZyyGVmWzsrY9kR7TmnuQqng="},"public":{"type":"Buffer","data":"J8LTxAiVLdNg8XFQMf6Hk2vHOHEe0uVl2Up7Vv/Mh2M="}}
918866813729	pre-key	5	{"private":{"type":"Buffer","data":"6C5SKyQWYmsNvCU3U2Afln9izBxR5S5nzDJvOHdaRlA="},"public":{"type":"Buffer","data":"UmEzaebqxuTUgT+L7hxNmUHAyRS/rUZuynMRLQY5dxM="}}
918866813729	pre-key	8	{"private":{"type":"Buffer","data":"GGRBmsNsd6b/PevwqzR7Q70KrpMB4nLBb1BMbtDVSnY="},"public":{"type":"Buffer","data":"o5ScZPxn45NLO/bfA5AWsQ9T5JHq1JZ5RcKnqyNoIxE="}}
918866813729	pre-key	9	{"private":{"type":"Buffer","data":"SPWPCfhOHCmr3ek6sGpEI4iIV+Oi+Oc4Fo/bYRpLUko="},"public":{"type":"Buffer","data":"t9Zm9L8Fm/72K6VlRbnfi7iZzbxCin6HcAL6Gzy8kzQ="}}
918866813729	pre-key	7	{"private":{"type":"Buffer","data":"KIlp9ya0DhUZ+P63xfwmtiADgPQcybnIsw2KnS7XFEM="},"public":{"type":"Buffer","data":"Mbt6H4ZlIS5Fs4DWSi9RkU+SmAlt2ndHrGed8nWbUGc="}}
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
918866813729	creds	base	{"noiseKey":{"private":{"type":"Buffer","data":"KGpetnHgh2bF7PQN1bVuZ2e+SutxCm3w2x4CKP79UkQ="},"public":{"type":"Buffer","data":"NDpbaPuceMJF1YYeKLJrT4ElOEbSy88aQOZuvBJgNQc="}},"pairingEphemeralKeyPair":{"private":{"type":"Buffer","data":"UGup0F1GfaFr7Ig/ntupm7qmp1p8xekBbNLZT84pFmA="},"public":{"type":"Buffer","data":"odJL7DXiSLbemBiDe0+TlhQsPqdxEZ2euRlqyPJ1NQs="}},"signedIdentityKey":{"private":{"type":"Buffer","data":"EMR1/h/vhxH7Rq7dZFHlULmAEaarcvDhCfaEbMBSm04="},"public":{"type":"Buffer","data":"t5TW64GHixFX1Vdf01dDytCK0gZJ0PJQ96rdbocBbSo="}},"signedPreKey":{"keyPair":{"private":{"type":"Buffer","data":"0ElMQVZFEjoDNIEmqcmKYXd++80IzZvtOJik0VIocl0="},"public":{"type":"Buffer","data":"WF3t3JRcYMz4KyBn89mzdAVh4zmtDSdoeBu75paI21Y="}},"signature":{"type":"Buffer","data":"7HAeqBZZ9CJ3URRCZ2a/N1jQfTAd/I9R4gycvBoS2yu+r9YgfJjxpAyidcuc7usmIjd23TdP/zInczjbm/XQCg=="},"keyId":1},"registrationId":188,"advSecretKey":"6a2s6natYva6qCTBNWXNUj8mlJRbAkD3XDCQm6L1S7A=","processedHistoryMessages":[],"nextPreKeyId":32,"firstUnuploadedPreKeyId":32,"accountSyncCounter":0,"accountSettings":{"unarchiveChats":false},"registered":false,"account":{"details":"CPeitq0CEMato9UGGAEgACgA","accountSignatureKey":"EWR7zQXitQiIJqqmi29P0iSsl84MiX8PfcS1kigpUkc=","accountSignature":"eApwTXL3DwGH1nBIcMJ2LLlF8HEFOYjSvPH04+OxDsWj9Q9RCgHd3bqV7iG/ecdsUlGGEl4MsVA9F7b/2nthCA==","deviceSignature":"T+AAl30DCLG21XzCn5LTeboljcidmaIPcxu5m74DAhPL6KrmB8fc0yxNLsHScilDUaBqwIHSIvfu6myLzC0sCQ=="},"me":{"id":"918866813729:93@s.whatsapp.net","name":"Robinson","lid":"140836490715296:93@lid"},"signalIdentities":[{"identifier":{"name":"918866813729:93@s.whatsapp.net","deviceId":0},"identifierKey":{"type":"Buffer","data":"BRFke80F4rUIiCaqpotvT9IkrJfODIl/D33EtZIoKVJH"}}],"platform":"smba","routingInfo":{"type":"Buffer","data":"CAIIEggI"},"lastAccountSyncTimestamp":1789453409,"myAppStateKeyId":"AAAAAEkG"}
918866813729	session	232770165039137.0	{"_sessions":{"BW5S5V1lio3D8OY5NW89WXCV7sVL8nflHeeKv1YrqPw6":{"registrationId":952642004,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BSmhDehUd74AyalaQ7ZjcCKU9UiBhqd7K4X14VFQVQoU","privKey":"yGd/xOyHekZorYHBc+D5H/F1edUwKSjiU+wx1iIJZ3g="},"lastRemoteEphemeralKey":"BXaF3+blsGAzmtyN3DmU4HN/al78XGe9Pw1NBQuxweZn","previousCounter":0,"rootKey":"ReacgOImAagxuclmts3UxKtfknOof9shwyk9b080KWY="},"indexInfo":{"baseKey":"BW5S5V1lio3D8OY5NW89WXCV7sVL8nflHeeKv1YrqPw6","baseKeyType":2,"closed":1789454513377,"used":1789453421773,"created":1789453421773,"remoteIdentityKey":"Bby5SNH+jIE2OtfjC7wStcsoHEWqAVios82IuC4lyE5W"},"_chains":{"BXaF3+blsGAzmtyN3DmU4HN/al78XGe9Pw1NBQuxweZn":{"chainKey":{"counter":2,"key":"K2izm1nKrBrtErhk2B45pcIoVzHC4/l8MTc4Rs3ZaNk="},"chainType":2,"messageKeys":{}},"BSmhDehUd74AyalaQ7ZjcCKU9UiBhqd7K4X14VFQVQoU":{"chainKey":{"counter":-1,"key":"/jyLSFcZWXyGA3m+9BjjcBZH6Yw9YxhpfrHRkA0GceE="},"chainType":1,"messageKeys":{}}}},"BfrbO2J96QI+zythpSQe7tJbpCChC0vJksWbnvPoNJ4g":{"registrationId":952642004,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BVqn7tqP2U2Oz1P39Gtny8O7hr2lwgLv8Tzb3rnKECFQ","privKey":"IO4U1GF2bRx5aE7uP/F6ygR44tpPH7vImNedcrAbkkY="},"lastRemoteEphemeralKey":"BeUORCQP/tVWjzVQm6086iT2eNdjPOi63g1Ub560kwYK","previousCounter":0,"rootKey":"NfeACQTbFBRlDTgU026FcKbBYE9uJoZl6s0244DTcIQ="},"indexInfo":{"baseKey":"BfrbO2J96QI+zythpSQe7tJbpCChC0vJksWbnvPoNJ4g","baseKeyType":1,"closed":1789454519272,"used":1789454513371,"created":1789454513371,"remoteIdentityKey":"Bby5SNH+jIE2OtfjC7wStcsoHEWqAVios82IuC4lyE5W"},"_chains":{"BVqn7tqP2U2Oz1P39Gtny8O7hr2lwgLv8Tzb3rnKECFQ":{"chainKey":{"counter":0,"key":"XNKJysy3SreDH1KPkXMUCo0RmFUkmL3diJ9PKEUyhlI="},"chainType":1,"messageKeys":{}}},"pendingPreKey":{"signedKeyId":2847746,"baseKey":"BfrbO2J96QI+zythpSQe7tJbpCChC0vJksWbnvPoNJ4g","preKeyId":21133}},"BXc7JuWbCVDsoEYcp9ABDoxswkm/FYRxy7BDOKXYfYI7":{"registrationId":952642004,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BVl63jVRvFn+nBPZXp0gPI6FGRieO7eofh74chwKrnw1","privKey":"EJ+ZfkUCRmFwY+studMmea+6AkoW6XTaNdBogp24+VY="},"lastRemoteEphemeralKey":"BeUORCQP/tVWjzVQm6086iT2eNdjPOi63g1Ub560kwYK","previousCounter":0,"rootKey":"XC6UQJ5Seq6Hi3V54bqNvYOOVPyesbXqR4NNHGs8mlY="},"indexInfo":{"baseKey":"BXc7JuWbCVDsoEYcp9ABDoxswkm/FYRxy7BDOKXYfYI7","baseKeyType":1,"closed":1789454990544,"used":1789454519265,"created":1789454519265,"remoteIdentityKey":"Bby5SNH+jIE2OtfjC7wStcsoHEWqAVios82IuC4lyE5W"},"_chains":{"BVl63jVRvFn+nBPZXp0gPI6FGRieO7eofh74chwKrnw1":{"chainKey":{"counter":0,"key":"Ebn0Vu1ia3APUROtDCJI/o8gwoiaM2AX/R00BWZ0Urc="},"chainType":1,"messageKeys":{}}},"pendingPreKey":{"signedKeyId":2847746,"baseKey":"BXc7JuWbCVDsoEYcp9ABDoxswkm/FYRxy7BDOKXYfYI7","preKeyId":21376}},"BWl3Q3wPi6poQBQry12Dt5FpK92oOk0AfFl8Xm8wo3A1":{"registrationId":952642004,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BbHHdt591UKTeq/yCVCJ6Fc96C/JT2SUg5dwF/LK34Vo","privKey":"mIEf/qXA9jgeVtR7WUAnLhyaVpXhnatsTWKX5WecW2M="},"lastRemoteEphemeralKey":"BeUORCQP/tVWjzVQm6086iT2eNdjPOi63g1Ub560kwYK","previousCounter":0,"rootKey":"h+YYn4YUWtgwZ99QkS2ozMOMbUEcjptAJj9e8ilBR+0="},"indexInfo":{"baseKey":"BWl3Q3wPi6poQBQry12Dt5FpK92oOk0AfFl8Xm8wo3A1","baseKeyType":1,"closed":1789455002355,"used":1789454990535,"created":1789454990535,"remoteIdentityKey":"Bby5SNH+jIE2OtfjC7wStcsoHEWqAVios82IuC4lyE5W"},"_chains":{"BbHHdt591UKTeq/yCVCJ6Fc96C/JT2SUg5dwF/LK34Vo":{"chainKey":{"counter":0,"key":"i5Xvdar5ocRi4czN8nX09Rs5UVMBKE1IRUMQ+ivFBwE="},"chainType":1,"messageKeys":{}}},"pendingPreKey":{"signedKeyId":2847746,"baseKey":"BWl3Q3wPi6poQBQry12Dt5FpK92oOk0AfFl8Xm8wo3A1","preKeyId":21422}},"BZGAV7oEyhAFFzDpg+c4U2WHbBAxIeyo9D2/tIr3jFs7":{"registrationId":952642004,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BVwyohjOSSYLXhYIbR1Ppbrvs8m39c2/wZ0WBkDcghR1","privKey":"EJZ8Y0nLJCA/+XKpqilr9TzaAXQnMB7MHEQ65nLDPE4="},"lastRemoteEphemeralKey":"BcyumOqi/qDZyw2Er4YCwgfbq+OxuKx9nAnP51JdYUEV","previousCounter":0,"rootKey":"Etc/6l4b0HOLTM7UQ43zxAqdWj6/sVBc3HDckQpkBik="},"indexInfo":{"baseKey":"BZGAV7oEyhAFFzDpg+c4U2WHbBAxIeyo9D2/tIr3jFs7","baseKeyType":1,"closed":1789455324980,"used":1789455330029,"created":1789455002347,"remoteIdentityKey":"Bby5SNH+jIE2OtfjC7wStcsoHEWqAVios82IuC4lyE5W"},"_chains":{"BcyumOqi/qDZyw2Er4YCwgfbq+OxuKx9nAnP51JdYUEV":{"chainKey":{"counter":2,"key":"LmR/SB0JRkaj3kAJ/KSvZlqJfGw99jL543CQlOXqWY0="},"chainType":2,"messageKeys":{}},"BVwyohjOSSYLXhYIbR1Ppbrvs8m39c2/wZ0WBkDcghR1":{"chainKey":{"counter":-1,"key":"8gcIc5Hr5wRUZq3w5oj5kzrtIZF8U6bSwYzlj9dJFyA="},"chainType":1,"messageKeys":{}}}},"Bf7alSePzD5DmN1NOlEDqzRPJCGQHbO+vAEgyBOp2rBg":{"registrationId":952642004,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BYOr+/Fv0ixdAIDp4fJTXGmsKvaDdO3EBr9MjA63/lMY","privKey":"eLgHEqUH9L9NK26wU80+OSI+ZIsDKi41l+PO+toUMU4="},"lastRemoteEphemeralKey":"BcyumOqi/qDZyw2Er4YCwgfbq+OxuKx9nAnP51JdYUEV","previousCounter":0,"rootKey":"wpzJDDfFRS4e+2hQRNVC2eugTAvi6XOyIdUbPtbYS+U="},"indexInfo":{"baseKey":"Bf7alSePzD5DmN1NOlEDqzRPJCGQHbO+vAEgyBOp2rBg","baseKeyType":1,"closed":1789455327527,"used":1789455324973,"created":1789455324973,"remoteIdentityKey":"Bby5SNH+jIE2OtfjC7wStcsoHEWqAVios82IuC4lyE5W"},"_chains":{"BcyumOqi/qDZyw2Er4YCwgfbq+OxuKx9nAnP51JdYUEV":{"chainKey":{"counter":2,"key":"m+t9Pbl+XDvJ9HXGAP3LQLJTr7HOqNmVu6RZ387anWM="},"chainType":2,"messageKeys":{"0":"x3HFk8t2ZK7lRPQLYd9J5Ghr/P81Vq7TS0sbKvwq6dU=","1":"UEapCoiS2++aqgvVlDnnARdvz3j/AUAVHX2g08XW99w="}},"BYOr+/Fv0ixdAIDp4fJTXGmsKvaDdO3EBr9MjA63/lMY":{"chainKey":{"counter":-1,"key":"Wudc95v1gYQ+cHVgSVb77E4zdO1LHNuuoczEA2zM2g4="},"chainType":1,"messageKeys":{}}},"pendingPreKey":{"signedKeyId":2847746,"baseKey":"Bf7alSePzD5DmN1NOlEDqzRPJCGQHbO+vAEgyBOp2rBg","preKeyId":21216}},"BRZYjRcwKc8or1NQ6i/qivuYCgDBQiNYWylkhA6uA9RU":{"registrationId":952642004,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BST0yMk3+x9aR/mcO+7InBaPLS05SBkA/k/wdjTaIyA1","privKey":"8E5o5KIjFL/m6YDXJ7XAqlI/sGr+NpAEdF9n88MW7XY="},"lastRemoteEphemeralKey":"BcyumOqi/qDZyw2Er4YCwgfbq+OxuKx9nAnP51JdYUEV","previousCounter":0,"rootKey":"L/KJ+S+LsFhL2K4UTCFKbUoY4B/gXK2l1zxsyDPsilo="},"indexInfo":{"baseKey":"BRZYjRcwKc8or1NQ6i/qivuYCgDBQiNYWylkhA6uA9RU","baseKeyType":1,"closed":1789456468172,"used":1789455327519,"created":1789455327519,"remoteIdentityKey":"Bby5SNH+jIE2OtfjC7wStcsoHEWqAVios82IuC4lyE5W"},"_chains":{"BcyumOqi/qDZyw2Er4YCwgfbq+OxuKx9nAnP51JdYUEV":{"chainKey":{"counter":2,"key":"uzFPj2rOuVN6CgThzNOKfCsL2xu9Sl0UZNeEgbd7ILk="},"chainType":2,"messageKeys":{"0":"YQZTM1J4mYFbGyOq4lM21u/pSkxqGcbvpJTJz1g1I8M=","1":"Szf5sSbK4PvAQgyTnsp7mtOM3Te1TsaRHPcTXS+FmP8="}},"BST0yMk3+x9aR/mcO+7InBaPLS05SBkA/k/wdjTaIyA1":{"chainKey":{"counter":-1,"key":"9p4SuKCoqSLbEQhsO++TdqNZno4TxVC8M6Qsdj+Pch8="},"chainType":1,"messageKeys":{}}},"pendingPreKey":{"signedKeyId":2847746,"baseKey":"BRZYjRcwKc8or1NQ6i/qivuYCgDBQiNYWylkhA6uA9RU","preKeyId":21366}},"BcUQNts06yZs1jVCMr6AVvv/MNeFGWqPYhgPF5M/32p3":{"registrationId":952642004,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"Bb9ypxHXtQVnoBVJpeoQZI9LfpvDRidBqnbzS0Bf0spL","privKey":"EKxHCFqd/W3IRFxflFomj6VofC+V1UIpkQ2csSJNAFg="},"lastRemoteEphemeralKey":"BeUORCQP/tVWjzVQm6086iT2eNdjPOi63g1Ub560kwYK","previousCounter":0,"rootKey":"+wfKtdvjFtjZYHJfudc7NVHmnZDiY6SYhPUdzyt2Rc4="},"indexInfo":{"baseKey":"BcUQNts06yZs1jVCMr6AVvv/MNeFGWqPYhgPF5M/32p3","baseKeyType":1,"closed":1789456498477,"used":1789456468161,"created":1789456468161,"remoteIdentityKey":"Bby5SNH+jIE2OtfjC7wStcsoHEWqAVios82IuC4lyE5W"},"_chains":{"Bb9ypxHXtQVnoBVJpeoQZI9LfpvDRidBqnbzS0Bf0spL":{"chainKey":{"counter":0,"key":"zL7gVEPhabw0Kchp7mEwEgix/I2zd5nbwAZOtlgx5m0="},"chainType":1,"messageKeys":{}}},"pendingPreKey":{"signedKeyId":2847746,"baseKey":"BcUQNts06yZs1jVCMr6AVvv/MNeFGWqPYhgPF5M/32p3","preKeyId":21384}},"BeBtMeolQV0FrRc9/BRJOLpPWrAuzSiVbVXcsowDVQEy":{"registrationId":952642004,"currentRatchet":{"ephemeralKeyPair":{"pubKey":"BTLK+ETgKmMBrnotGMeagLinfYADSwbNwJbd/OHKfa5K","privKey":"MGEJs5eGa4DP5/LCSjuzdJwfD1q8QGVEu7pYA8AVIW4="},"lastRemoteEphemeralKey":"BeUORCQP/tVWjzVQm6086iT2eNdjPOi63g1Ub560kwYK","previousCounter":0,"rootKey":"n43xDodosSBjcAsYOgVdyvJVwUdO4k/orJPb0JekuTw="},"indexInfo":{"baseKey":"BeBtMeolQV0FrRc9/BRJOLpPWrAuzSiVbVXcsowDVQEy","baseKeyType":1,"closed":-1,"used":1789456498470,"created":1789456498470,"remoteIdentityKey":"Bby5SNH+jIE2OtfjC7wStcsoHEWqAVios82IuC4lyE5W"},"_chains":{"BTLK+ETgKmMBrnotGMeagLinfYADSwbNwJbd/OHKfa5K":{"chainKey":{"counter":0,"key":"+KyA6loQdtKkLlyGrYciSOfLP6kE9TyR5CQuCa9A3B0="},"chainType":1,"messageKeys":{}}},"pendingPreKey":{"signedKeyId":2847746,"baseKey":"BeBtMeolQV0FrRc9/BRJOLpPWrAuzSiVbVXcsowDVQEy","preKeyId":21262}}},"version":"v1"}
\.


--
-- Data for Name: Stats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Stats" (id, "totalMessagesSent") FROM stdin;
1	5
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
\.


--
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Users" (id, number, name, gender, password, "userType", "validDays", "isActive", "webhookUrl", "createdAt", "updatedAt", "deletedAt") FROM stdin;
2	919999999999	Default Admin	Other	admin123	admin	365	t	\N	2026-09-15 13:59:43.877+05:30	2026-09-15 14:16:19.417+05:30	\N
1	918866813729	Robinson Macwan	Male	Test@123	user	3	t	\N	2026-09-15 10:54:34.841+05:30	2026-09-15 14:17:22.546+05:30	\N
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

SELECT pg_catalog.setval('public."MessageLogs_id_seq"', 10, true);


--
-- Name: Plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Plans_id_seq"', 1, false);


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
-- Name: Templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Templates_id_seq"', 1, false);


--
-- Name: Tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Tokens_id_seq"', 9, true);


--
-- Name: Users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Users_id_seq"', 2, true);


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
-- Name: Plans Plans_planId_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key4" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key5" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key6" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key7" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key8" UNIQUE ("planId");


--
-- Name: Plans Plans_planId_key9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plans"
    ADD CONSTRAINT "Plans_planId_key9" UNIQUE ("planId");


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
-- Name: Tokens Tokens_token_key4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key4" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key5" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key6" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key7" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key8" UNIQUE (token);


--
-- Name: Tokens Tokens_token_key9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tokens"
    ADD CONSTRAINT "Tokens_token_key9" UNIQUE (token);


--
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict jZDN1w8oAYcUQQ0aWom7vG6TpVHLCh46RAttVYt7Da9vT5tQzgaspzfZwVQhe28

