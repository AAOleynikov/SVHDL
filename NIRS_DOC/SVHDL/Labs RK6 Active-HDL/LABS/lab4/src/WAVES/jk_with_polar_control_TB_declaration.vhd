-------------------------------------------------------------------------------
--
-- Title       : 
-- Design      : lab4
-- Author      : 666anton2005xr@gmail.com
-- Company     : 666anton2005xr@gmail.com
--
-------------------------------------------------------------------------------
--
-- File        : jk_with_polar_control_TB.vhd
-- Generated   : Sun May  5 19:22:55 2024
-- From        : C:\Users\666an\Documents\BMSTU\MVHDL\Labs (2)\lab4\src\WAVES\jk_with_polar_control_TB_settings.txt
-- By          : tb_generator.pl ver. ver 1.2s
--
-------------------------------------------------------------------------------
--
-- Description : declaration of DESIGN_DECLARATION package
--
-------------------------------------------------------------------------------

--The DESIGN_DECLARATION package contains design specific declarations used in Testbench.
library IEEE;
use IEEE.std_logic_1164.all;
use STD.TEXTIO.all;
use IEEE.STD_LOGIC_TEXTIO.all;
use IEEE.waves_interface.all;
USE WORK.UUT_test_pins.all;

package DESIGN_DECLARATIONS is
	-- UUT ports name strings

	--Report file name declaration
	file REP_FILE : TEXT open WRITE_MODE is "$dsn\src\WAVES\jk_with_polar_control_report.log";
	-- Test vectors file name declaration.
	file VECTOR_FILE : TEXT open READ_MODE is "$dsn\src\WAVES\";
	-- WGP (WAVE Generator Procedure) declarations
	type WND_TAGS is (START_T, END_T);
	type WND_TIMES is array (TEST_PINS, WND_TAGS) of EVENT_TIME;

	-- Constants declared below set the COMPARE WINDOW parameters.
	-- User can modify these values.
	constant WND_BEGIN_DEFAULT: EVENT_TIME := 1 ps;
	constant WND_END_DEFAULT: EVENT_TIME := 0 ps;

	-- Constant declared below sets the STIMULUS FRAME parameters.
	-- User can modify these values.
	constant STIM_BEGIN_DEFAULT: EVENT_TIME := 0 ns;

	-- Constant declared below defines the STIMULUS FRAMEs and COMPARE WINDOWs
	-- for all UUT ports present in the test vector file.


	procedure CLOSE_VECTOR;
	procedure CLOSE_REPORT;

end DESIGN_DECLARATIONS;

package  body DESIGN_DECLARATIONS is
	procedure CLOSE_VECTOR is
	begin

	file_close (VECTOR_FILE);
	end;

	procedure CLOSE_REPORT is
	begin

	file_close (REP_FILE);
	end;
end package body;

