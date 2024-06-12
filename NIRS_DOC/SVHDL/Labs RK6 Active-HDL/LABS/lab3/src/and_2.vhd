library IEEE;
use IEEE.STD_LOGIC_1164.all;

entity and_2 is
	port(
		x1 : in STD_LOGIC;
		x2 : in STD_LOGIC;
		y : out STD_LOGIC
	);
end and_2;

architecture and_2 of and_2 is
begin
	y <= x1 and x2 after 1ms;
end and_2;
