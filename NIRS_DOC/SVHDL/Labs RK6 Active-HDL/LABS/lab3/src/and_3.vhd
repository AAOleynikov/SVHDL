library IEEE;
use IEEE.STD_LOGIC_1164.all;

entity and_3 is
	port(
		x1 : in STD_LOGIC;
		x2 : in STD_LOGIC;
		x3 : in STD_LOGIC;
		y : out STD_LOGIC
	);
end and_3;

architecture and_3 of and_3 is
begin
	y <= x1 and x2 and x3 after 1ms;
end and_3;
