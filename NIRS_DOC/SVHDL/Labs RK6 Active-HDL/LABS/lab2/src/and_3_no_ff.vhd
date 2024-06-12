library IEEE;
use IEEE.STD_LOGIC_1164.all;

entity and_3_no is
	 port(
		 x1 : in STD_LOGIC;
		 x2 : in STD_LOGIC;
		 x3 : in STD_LOGIC;
		 y : out STD_LOGIC
	     );
end and_3_no;

architecture and_3_no of and_3_no is
begin
	 y <= not (x1 and x2 and x3) after 1ms;
end and_3_no;
