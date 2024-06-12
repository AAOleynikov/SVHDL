library IEEE;
use IEEE.STD_LOGIC_1164.all;

entity no is
	port(
		x : in STD_LOGIC;
		y : out STD_LOGIC
	);
end no;

architecture no of no is
begin
	y <= not x after 1ms;
end no;
