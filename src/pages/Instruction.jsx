import "../styles/instruction.css";
import React, {useState} from "react";
import {Link} from "react-router-dom";
import { useTranslation, Trans } from 'react-i18next';
import tlg_auth from "../img/instuction/tlg_auth.webp";
import tlg_reg from "../img/instuction/tlg_reg.webp";
import tlg_start from "../img/instuction/tlg_start.webp";
import tlg_next_publ from "../img/instuction/tlg_next_publ.webp";
import tlg_stats from "../img/instuction/tlg_stats.webp";
import tlg_rename from "../img/instuction/tlg_rename.webp";
import tlg_sociology from "../img/instuction/tlg_sociology.webp";
import tlg_support from "../img/instuction/tlg_support.webp";
import tlg_cancel from "../img/instuction/tlg_cancel.webp";
import tlg_menu from "../img/instuction/tlg_menu.webp";
import site_auth from "../img/instuction/site-auth1.webp";
import site_auth2 from "../img/instuction/site-auth2.webp";
import publ1 from "../img/instuction/publ1.webp";
import publ2 from "../img/instuction/publ2.webp";
import publ3 from "../img/instuction/publ3.webp";
import publ4 from "../img/instuction/publ4.webp";
import publ5 from "../img/instuction/publ5.webp";
import publ6 from "../img/instuction/publ6.webp";
import work1 from "../img/instuction/work.webp";
import work2 from "../img/instuction/work2.webp";
import geo from "../img/instuction/geo.webp";
import geo2 from "../img/instuction/geo2.webp";
import geo3 from "../img/instuction/geo3.webp";
import geo4 from "../img/instuction/geo4.webp";
import adm from "../img/instuction/adm.webp";
import image37 from "../img/instuction/image37.webp";
import adm2 from "../img/instuction/adm2.webp";
import image39 from "../img/instuction/image39.webp";
import image40 from "../img/instuction/image40.webp";
import adm3 from "../img/instuction/adm3.webp";
import adm4 from "../img/instuction/adm4.webp";
import eve1 from "../img/instuction/eve1.webp";
import eve2 from "../img/instuction/eve2.webp";
import eve3 from "../img/instuction/eve3.webp";
import image25 from "../img/instuction/image25.webp";
import image26 from "../img/instuction/image26.webp";
import eve4 from "../img/instuction/eve4.webp";
import image9 from "../img/instuction/image9.webp";
import eve5 from "../img/instuction/eve5.webp";
import tax1 from "../img/instuction/tax1.webp";
import tax2 from "../img/instuction/tax2.webp";
import tax3 from "../img/instuction/tax3.webp";
import tax4 from "../img/instuction/tax4.webp";
import coord1 from "../img/instuction/coord1.webp";
import coord2 from "../img/instuction/coord2.webp";

export const Introduction = () => {
    const { t } = useTranslation('instruction');
    const [collapsed, setCollapsed] = useState({
        requirements: false,
        registration: false,
        telegram_bot: false,
        publ_structure: false,
        beginning_work: false,
        geo: false,
        adm: false,
        eve: false,
        tax: false,
        count: false,
        extra: false
    });
    return (
        <div className="instr-content">
            <h1>{t("title")}</h1>

            <div className="instruction-content">
                <div className="section">
                    <div className={`section-header ${
                        !collapsed.requirements ? "collapsed" : ""
                    }`}
                         onClick={() =>
                             setCollapsed(
                                 {...collapsed, requirements: !collapsed.requirements}
                             )
                         }>
                        <h2>{t("sections.requirements.title")}</h2>
                        <button
                            className={`collapse-toggle ${
                                collapsed.requirements ? "collapsed" : ""
                            }`}
                            type="button"
                            onClick={() =>
                                setCollapsed(
                                    {...collapsed, requirements: !collapsed.requirements}
                                )
                            }
                        >
                            {collapsed.requirements
                                ? "⌃"
                                : "⌃"}
                        </button>
                    </div>
                    {collapsed.requirements && (
                    <ol>
                        <li>{t("sections.requirements.first")}</li>
                        <li>{t("sections.requirements.second")}</li>
                        <li>{t("sections.requirements.third")}</li>
                        <li>{t("sections.requirements.fourth")}</li>
                    </ol>)}
                </div>
                <div className="section">
                    <div className={`section-header ${
                        !collapsed.registration ? "collapsed" : ""
                    }`}
                         onClick={() =>
                             setCollapsed(
                                 {...collapsed, registration: !collapsed.registration}
                             )
                         }>
                        <h2>{t("sections.registration.title")}</h2>
                        <button
                            className={`collapse-toggle ${
                                collapsed.registration ? "collapsed" : ""
                            }`}
                            type="button"
                            onClick={() =>
                                setCollapsed(
                                    {...collapsed, registration: !collapsed.registration}
                                )
                            }
                        >
                            {collapsed.registration
                                ? "⌃"
                                : "⌃"}
                        </button>
                    </div>
                    {collapsed.registration && (
                        <>
                    <div>
                        <p>{t("sections.registration.step11")}
                            <Link to={"https://t.me/FaunisticaV3Bot"} target={"_blank"}> https://t.me/FaunisticaV3Bot</Link><br/>
                            {t("sections.registration.step12")}
                            <br/>
                            <br/>
                        </p>
                        <div className="img-box">
                            <img src={tlg_reg} alt={t("alts.tlg_reg")}/>
                            <img src={tlg_auth} alt={t("alts.tlg_auth")}/>

                        </div>
                    </div>
                    <div>
                        <p>{t("sections.registration.step21")} <Link to={"https://faunistica.ru/"} target={"_blank"}>https://faunistica.ru/</Link> {t("sections.registration.step22")}<br/><br/></p>
                        <img className={"full-width"} src={site_auth} alt={t("alts.site_auth")}/>
                    </div>
                    <div className="horizontal">
                        <p>{t("sections.registration.step3")}</p>
                        <img src={site_auth2} alt={t("alts.site_auth2")}/>
                    </div>
                    <p>{t("sections.registration.success")} </p>
                        </>)}
                </div>
                <div className="section">
                    <div className={`section-header ${
                        !collapsed.telegram_bot ? "collapsed" : ""
                    }`}
                         onClick={() =>
                             setCollapsed(
                                 {...collapsed, telegram_bot: !collapsed.telegram_bot}
                             )
                         }>
                        <h2>{t("sections.telegram_bot.title")}</h2>
                        <button
                            className={`collapse-toggle ${
                                collapsed.telegram_bot ? "collapsed" : ""
                            }`}
                            type="button"
                            onClick={() =>
                                setCollapsed(
                                    {...collapsed, telegram_bot: !collapsed.telegram_bot}
                                )
                            }
                        >
                            {collapsed.telegram_bot
                                ? "⌃"
                                : "⌃"}
                        </button>
                    </div>
                    {collapsed.telegram_bot && (
                        <>
                            <div className={"horizontal"}>
                                <h3>{t("sections.telegram_bot.description")}</h3>
                            </div>
                            <div>
                                <p>{t("sections.telegram_bot.command1")}
                                    <br/>
                                    <br/>
                                </p>
                                <div className="img-box">
                                    <img src={tlg_start} alt={t("alts.tlg_start")}/>
                                </div>
                            </div>

                            <div>
                                <p>{t("sections.telegram_bot.command2")}
                                    <br/>
                                    <br/>
                                </p>
                                <div className="img-box">
                                    <img src={tlg_reg} alt={t("alts.tlg_reg")}/>
                                </div>
                            </div>

                            <div>
                                <p>{t("sections.telegram_bot.command3")}
                                    <br/>
                                    <br/>
                                </p>
                                <div className="img-box">
                                    <img src={tlg_auth} alt={t("alts.tlg_auth")}/>
                                </div>
                            </div>

                            <div>
                                <p>{t("sections.telegram_bot.command4")}
                                    <br/>
                                    <br/>
                                </p>
                                <div className="img-box">
                                    <img src={tlg_next_publ} alt={t("alts.tlg_next_publ")}/>
                                </div>
                            </div>

                            <div>
                                <p>{t("sections.telegram_bot.command5")}
                                    <br/>
                                    <br/>
                                </p>
                                <div className="img-box">
                                    <img src={tlg_stats} alt={t("alts.tlg_stats")}/>
                                </div>
                            </div>

                            <div>
                                <p>{t("sections.telegram_bot.command6")}
                                    <br/>
                                    <br/>
                                </p>
                                <div className="img-box">
                                    <img src={tlg_rename} alt={t("alts.tlg_rename")}/>
                                </div>
                            </div>

                            <div>
                                <p>{t("sections.telegram_bot.command7")}
                                    <br/>
                                    <br/>
                                </p>
                                <div className="img-box">
                                    <img src={tlg_sociology} alt={t("alts.tlg_sociology")}/>
                                </div>
                            </div>

                            <div>
                                <p>{t("sections.telegram_bot.command8")}
                                    <br/>
                                    <br/>
                                </p>
                                <div className="img-box">
                                    <img src={tlg_support} alt={t("alts.tlg_support")}/>
                                </div>
                            </div>

                            <div>
                                <p>{t("sections.telegram_bot.command9")}
                                    <br/>
                                    <br/>
                                </p>
                                <div className="img-box">
                                    <img src={tlg_cancel} alt={t("alts.tlg_cancel")}/>
                                </div>
                            </div>

                            <div className={"attention"}>
                                <p>{t("sections.telegram_bot.alert")} <Link to={"https://faunistica.ru/feedback"} target={"_blank"}>https://faunistica.ru/feedback</Link>
                                    <br/>
                                    <br/>
                                </p>
                            </div>

                            <div>
                                <p>{t("sections.telegram_bot.command10")}
                                    <br/>
                                    <br/>
                                </p>
                                <div className="img-box">
                                    <img src={tlg_menu} alt={t("alts.tlg_menu")}/>
                                </div>
                            </div>
                        </>)}
                </div>
                <div className="section">
                    <div className={`section-header ${
                        !collapsed.publ_structure ? "collapsed" : ""
                    }`}
                         onClick={() =>
                             setCollapsed(
                                 {...collapsed, publ_structure: !collapsed.publ_structure}
                             )
                         }>
                        <h2>{t("sections.publ_structure.title")}</h2>
                        <button
                            className={`collapse-toggle ${
                                collapsed.publ_structure ? "collapsed" : ""
                            }`}
                            type="button"
                            onClick={() =>
                                setCollapsed(
                                    {...collapsed, publ_structure: !collapsed.publ_structure}
                                )
                            }
                        >
                            {collapsed.publ_structure
                                ? "⌃"
                                : "⌃"}
                        </button>
                    </div>
                    {collapsed.publ_structure && (
                        <>
                    <p><Trans i18nKey="sections.publ_structure.definition">
                        <b>Scientific publication</b> is a published work created in accordance with academic standards of text structure and formatting, which has been published in print or on electronic media.
                    </Trans>
                        <br/>
                        <br/>
                        {t("sections.publ_structure.types_intro")}</p>
                    <ul>
                        <li>{t("sections.publ_structure.types.articles")}</li>
                        <li>{t("sections.publ_structure.types.monographs")}</li>
                        <li>{t("sections.publ_structure.types.conference_materials")}</li>
                        <li>{t("sections.publ_structure.types.dissertations")}</li>
                    </ul>
                    <h3>{t("sections.publ_structure.how_it_works")}</h3>
                    <p>
                        {t("sections.publ_structure.top_block")}
                        <br/>
                        <br/>
                        {t("sections.publ_structure.udk_explanation")}
                    </p>
                    <div className="horizontal">
                        <img className="publ" src={publ1} alt={t("sections.publ_structure.alts.publ1")}/>
                        <p>
                            {t("sections.publ_structure.title_explanation")}
                            <br/>
                            <br/>
                            {t("sections.publ_structure.english_similarity")}
                        </p>
                    </div>
                    <div className="horizontal">
                        <img className="publ" src={publ2} alt={t("sections.publ_structure.alts.publ2")}/>
                        <p>
                            {t("sections.publ_structure.example_no_udk")}
                            <br/>
                            <br/>
                            {t("sections.publ_structure.another_example")}
                        </p>
                    </div>
                    <div className="horizontal">
                        <img className="publ" src={publ3} alt={t("sections.publ_structure.alts.publ3")}/>
                        <p>
                            {t("sections.publ_structure.introduction_section")}
                            <br/>
                            <br/>
                            {t("sections.publ_structure.introduction_absence")}
                        </p>
                    </div>
                    <div className="horizontal">
                        <img className="publ" src={publ4} alt={t("sections.publ_structure.alts.publ4")}/>
                        <p>
                            {t("sections.publ_structure.materials_methods")}
                        </p>
                    </div>
                    <p>
                        {t("sections.publ_structure.main_part")}
                    </p>
                    <div className="horizontal">
                        <img className="publ" src={publ5} alt={t("sections.publ_structure.alts.publ5")}/>
                        <img className="publ" src={publ6} alt={t("sections.publ_structure.alts.publ6")}/>
                    </div>
                    <p>
                        {t("sections.publ_structure.discussion_conclusion")}
                    </p>
                        </>)}
                </div>

                <div className="section">
                    <div className={`section-header ${
                        !collapsed.beginning_work ? "collapsed" : ""
                    }`}
                         onClick={() =>
                             setCollapsed(
                                 {...collapsed, beginning_work: !collapsed.beginning_work}
                             )
                         }>
                        <h2>{t("sections.beginning_work.title")}</h2>
                        <button
                            className={`collapse-toggle ${
                                collapsed.beginning_work ? "collapsed" : ""
                            }`}
                            type="button"
                            onClick={() =>
                                setCollapsed(
                                    {...collapsed, beginning_work: !collapsed.beginning_work}
                                )
                            }
                        >
                            {collapsed.beginning_work
                                ? "⌃"
                                : "⌃"}
                        </button>
                    </div>
                    {collapsed.beginning_work && (
                        <>
                    <p>
                        {t("sections.beginning_work.article_description")}
                    </p>
                    <img className="full-width middle" src={work1} alt={t("sections.beginning_work.alts.work1")}/>
                    <p>{t("sections.beginning_work.new_tab")}</p>
                    <p>
                        {t("sections.beginning_work.fields_description")}
                    </p>
                    <h3>{t("sections.beginning_work.recommendations")}</h3>
                    <ol>
                        <li>{t("sections.beginning_work.recommendations1")}</li>
                        <li>{t("sections.beginning_work.recommendations2")}</li>
                        <li>{t("sections.beginning_work.recommendations3")}</li>
                    </ol>
                    <p>{t("sections.beginning_work.input_text_button")}</p>
                    <img className={"full-width middle"} src={work2} alt={t("sections.beginning_work.alts.work2")}/>
                    <p>
                        {t("sections.beginning_work.copy_text")}
                    </p>
                    <div className="attention">
                        <p>
                            {t("sections.beginning_work.attention")}
                        </p>
                        <p>
                            {t("sections.beginning_work.auto_fill_warning")}
                        </p>
                    </div>
                        </>)}
                </div>
                <div className="section">
                    <div className={`section-header ${
                        !collapsed.geo ? "collapsed" : ""
                    }`}
                         onClick={() =>
                             setCollapsed(
                                 {...collapsed, geo: !collapsed.geo}
                             )
                         }>
                        <h2>{t("sections.geo.title")}</h2>
                        <button
                            className={`collapse-toggle ${
                                collapsed.geo ? "collapsed" : ""
                            }`}
                            type="button"
                            onClick={() =>
                                setCollapsed(
                                    {...collapsed, geo: !collapsed.geo}
                                )
                            }
                        >
                            {collapsed.geo
                                ? "⌃"
                                : "⌃"}
                        </button>
                    </div>
                    {collapsed.geo && (
                        <>
                    <img className={"full-width"} src={geo} alt={t("sections.geo.alts.geo")}/>
                    <p>
                        {t("sections.geo.find_coordinates")}
                    </p>
                    <img className={"full-width middle"} src={geo2} alt={t("sections.geo.alts.geo2")}/>
                    <p>{t("sections.geo.coordinates_difficulties")}
                    </p>
                    <p>{t("sections.geo.no_coordinates_option")}</p>
                    <img className={"full-width middle"} src={geo3} alt={t("sections.geo.alts.geo3")}/>
                    <p>
                        <Trans i18nKey="sections.geo.example2_intro" t={t}>
                            В публикации из <Link to={"https://sozontov.cc/arachnolibrary/files/p5099_2014_Esyunin_Ukhova.pdf"} target={"_blank"}>Примера 2</Link> в начале статьи, даны координаты каждой исследованной площадки. Две площадки выделены желтым для примера:
                        </Trans>
                    </p>
                            <div className={"horizontal"}>
                                <img src={coord1} alt={t("sections.geo.alts.coord1")}/>
                                <img src={coord2} alt={t("sections.geo.alts.coord2")}/>
                            </div>
                    <p>
                        {t("sections.geo.degrees_minutes_format")}
                    </p>
                    <img className={"full-width middle"} src={geo4} alt={t("sections.geo.alts.geo4")}/>
                    <p>{t("sections.geo.coordinates_source")}</p>
                    <p>
                        {t("sections.geo.radius_explanation")}
                        <br/>
                        <br/>
                        {t("sections.geo.georeferencing")}
                        <br/>
                        <br/>
                        {t("sections.geo.georeferencing_offer")}
                    </p>
                        </>)}
                </div>
                <div className="section">
                    <div className={`section-header ${
                        !collapsed.adm ? "collapsed" : ""
                    }`}
                         onClick={() =>
                             setCollapsed(
                                 {...collapsed, adm: !collapsed.adm}
                             )
                         }>
                        <h2>{t("sections.adm.title")}</h2>
                        <button
                            className={`collapse-toggle ${
                                collapsed.adm ? "collapsed" : ""
                            }`}
                            type="button"
                            onClick={() =>
                                setCollapsed(
                                    {...collapsed, adm: !collapsed.adm}
                                )
                            }
                        >
                            {collapsed.adm
                                ? "⌃"
                                : "⌃"}
                        </button>
                    </div>
                    {collapsed.adm && (
                        <>
                    <img className={"full-width"} src={adm} alt={t("sections.adm.alts.adm")}/>
                    <p>
                        {t("sections.adm.block_description")}
                        <br/>
                        <br/>
                        {t("sections.adm.region_district")}
                    </p>
                    <div className="horizontal">
                        <p>
                            {t("sections.adm.ural_focus")}
                        </p>
                        <img src={image37} alt={t("sections.adm.alts.image37")}/>
                    </div>
                    <p>{t("sections.adm.collection_location")}</p>
                    <h3>{t("sections.adm.examples_heading")}</h3>
                    <p>{t("sections.adm.example1_intro")}</p>
                    <p>{t("sections.adm.english_publication")}</p>
                    <p>{t("sections.adm.example1_region")}</p>
                    <img className={"full-width middle"} src={adm2} alt={t("sections.adm.alts.adm2")}/>
                    <p>{t("sections.adm.example1_locations")}</p>
                    <div className="horizontal">
                        <img src={image39} alt={t("sections.adm.alts.image39")}/>
                        <img src={image40} alt={t("sections.adm.alts.image40")}/>
                    </div>
                    <div className="horizontal">
                        <p>
                            {t("sections.adm.example1_conclusion")}
                            <br />
                            <br />
                            {t("sections.adm.example1_location_entry")}
                        </p>
                        <img src={adm3} alt={t("sections.adm.alts.adm3")}/>
                    </div>
                    <p>{t("sections.adm.example2_location")}</p>
                    <p>{t("sections.adm.example2_reserve")}</p>
                    <p>{t("sections.adm.filled_example")}</p>
                    <img className={"full-width"} src={adm4} alt={t("sections.adm.alts.adm4")}/>
                        </>)}
                </div>
                <div className="section">
                    <div className={`section-header ${
                        !collapsed.eve ? "collapsed" : ""
                    }`}
                         onClick={() =>
                             setCollapsed(
                                 {...collapsed, eve: !collapsed.eve}
                             )
                         }>
                        <h2>{t("sections.eve.title")}</h2>
                        <button
                            className={`collapse-toggle ${
                                collapsed.eve ? "collapsed" : ""
                            }`}
                            type="button"
                            onClick={() =>
                                setCollapsed(
                                    {...collapsed, eve: !collapsed.eve}
                                )
                            }
                        >
                            {collapsed.eve
                                ? "⌃"
                                : "⌃"}
                        </button>
                    </div>
                    {collapsed.eve && (
                        <>
                    <img className={"full-width"} src={eve1} alt={t("sections.eve.alts.eve1")}/>
                        <div className="horizontal">
                            <p>
                                {t("sections.eve.dates_description")}
                            </p>
                            <img src={eve2} alt={t("sections.eve.alts.eve2")}/>
                        </div>
                        <div className="horizontal">
                            <p>
                                {t("sections.eve.date_absence")}
                            </p>
                            <img src={eve3} alt={t("sections.eve.alts.eve3")}/>
                        </div>

                    <p>{t("sections.eve.biotope_definition")}</p>

                    <div className="horizontal">
                            <p>{t("sections.eve.example1_biotopes")}
                                <br/>
                                <br/>
                                <br/>
                            {t("sections.eve.yellow_text")}</p>
                        <img className={"small"} src={image25} alt={t("sections.eve.alts.image25")}/>
                    </div>
                    <p>{t("sections.eve.example2_biotope")}</p>
                    <p>{t("sections.eve.quarter_altitude")}</p>
                    <p>{t("sections.eve.detailed_descriptions")}</p>
                    <p>{t("sections.eve.collector_example1")}</p>
                    <div className="horizontal">
                        <img src={image26} alt={t("sections.eve.alts.image26")}/>
                        <p>{t("sections.eve.full_collector_info")}</p>
                    </div>
                    <p>{t("sections.eve.no_collector_info")}</p>
                    <p>{t("sections.eve.selective_effort")}</p>
                    <p>{t("sections.eve.filled_example1")}</p>
                    <img className={"full-width"} src={eve4} alt={t("sections.eve.alts.eve4")}/>
                    <p>{t("sections.eve.filled_example2")}</p>
                    <img className={"full-width middle"} src={image9} alt={t("sections.eve.alts.image9")}/>
                    <img className={"full-width"} src={eve5} alt={t("sections.eve.alts.eve5")}/>
                    <div className="attention">
                        <p>{t("sections.eve.effort_absence")}</p>
                    </div>
                        </>)}
                </div>
                <div className="section">
                    <div className={`section-header ${
                        !collapsed.tax ? "collapsed" : ""
                    }`}
                         onClick={() =>
                             setCollapsed(
                                 {...collapsed, tax: !collapsed.tax}
                             )
                         }>
                        <h2>{t("sections.tax.title")}</h2>
                        <button
                            className={`collapse-toggle ${
                                collapsed.tax ? "collapsed" : ""
                            }`}
                            type="button"
                            onClick={() =>
                                setCollapsed(
                                    {...collapsed, tax: !collapsed.tax}
                                )
                            }
                        >
                            {collapsed.tax
                                ? "⌃"
                                : "⌃"}
                        </button>
                    </div>
                    {collapsed.tax && (
                        <>
                    <img className={"full-width"} src={tax1} alt={t("sections.tax.alts.tax1")}/>
                    <p>
                        {t("sections.tax.latin_names")}
                        <br/>
                        <br/>
                        {t("sections.tax.spiders_order")}
                        <br/>
                        <br/>
                        {t("sections.tax.families_explanation")}
                        <br/>
                        <br/>
                        {t("sections.tax.dropdown_help")}
                        <br/>
                        <br/>
                        {t("sections.tax.example1_appearance")}
                    </p>
                    <div className={"horizontal"}>
                        <img className="small" src={tax2} alt={t("sections.tax.alts.tax2")}/>
                        <img className={"middle"} src={tax3} alt={t("sections.tax.alts.tax3")}/>
                    </div>
                    <p>
                        {t("sections.tax.missing_species")}
                        <br/>
                        <br/>
                        {t("sections.tax.abbreviated_names")}
                        <br/>
                        <br/>
                        {t("sections.tax.new_species")}
                    </p>
                        </>)}
                </div>
                <div className={"section"}>
                    <div className={`section-header ${
                        !collapsed.count ? "collapsed" : ""
                    }`}
                         onClick={() =>
                             setCollapsed(
                                 {...collapsed, count: !collapsed.count}
                             )
                         }>
                        <h2>{t("sections.count.title")}</h2>
                        <button
                            className={`collapse-toggle ${
                                collapsed.count ? "collapsed" : ""
                            }`}
                            type="button"
                            onClick={() =>
                                setCollapsed(
                                    {...collapsed, count: !collapsed.count}
                                )
                            }
                        >
                            {collapsed.count
                                ? "⌃"
                                : "⌃"}
                        </button>
                    </div>
                    {collapsed.count && (
                        <>
                    <p>
                        {t("sections.count.gender_age")}
                        <br/>
                        <br/>
                        {t("sections.count.symbols.male")}
                        <br/>
                        {t("sections.count.symbols.males")}
                        <br/>
                        {t("sections.count.symbols.female")}
                        <br/>
                        {t("sections.count.symbols.females")}
                        <br/>
                        {t("sections.count.symbols.juvenile")}<br/>
                        {t("sections.count.symbols.subadult")}<br/>
                        {t("sections.count.quantity_rules1")}<br/>
                        {t("sections.count.quantity_rules2")}<br/>
                        {t("sections.count.quantity_rules3")}<br/>
                        {t("sections.count.quantity_rules4")}<br/>
                        {t("sections.count.example2_table")}
                    </p>
                    <img className={"full-width middle"} src={tax4} alt={t("sections.count.alts.tax4")}/>
                    <p>{t("sections.count.two_indicators")}</p>
                    <p>{t("sections.count.more_significant")}</p>
                        </>)}
                </div>
                <div className={"section"}>
                    <div className={`section-header ${
                        !collapsed.extra ? "collapsed" : ""
                    }`}
                         onClick={() =>
                             setCollapsed(
                                 {...collapsed, extra: !collapsed.extra}
                             )
                         }>
                        <h2>{t("sections.extra.title")}</h2>
                        <button
                            className={`collapse-toggle ${
                                collapsed.extra ? "collapsed" : ""
                            }`}
                            type="button"
                            onClick={() =>
                                setCollapsed(
                                    {...collapsed, extra: !collapsed.extra}
                                )
                            }
                        >
                            {collapsed.extra
                                ? "⌃"
                                : "⌃"}
                        </button>
                    </div>
                    {collapsed.extra && (
                        <>
                    <h3>{t("sections.extra.locks_heading")}</h3>
                    <p>
                        {t("sections.extra.locks_description")}
                    </p>
                    <p>{t("sections.extra.locks_saving")}</p>
                    <div className={"attention"}>
                        <p>{t("sections.extra.locks_warning")}</p>
                    </div>
                    <p>{t("sections.extra.locks_availability")}</p>
                    <h3>{t("sections.extra.clear_forms_heading")}</h3>
                    <p>{t("sections.extra.partial_clearing")}
                        <br/>
                        <br/>
                        {t("sections.extra.full_clearing")}
                        <br/>
                        <br/>
                        {t("sections.extra.full_clearing_effect")}</p>
                    <h3>{t("sections.extra.collapse_heading")}</h3>
                    <p>
                        {t("sections.extra.collapse_description")}
                    </p>
                        </>)}
                </div>
            </div>
        </div>
    )
};