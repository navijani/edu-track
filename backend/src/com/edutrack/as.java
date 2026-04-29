begin
process (Clk, Reset) begin
if (Reset = '1') then
Q <= "000"; -- reset the register asynchronously
else if (rising_edge(Clk)) then -- respond when clock rises
if En = '1' then -- Enable should be set
Q <= D;
end if;
end if;
end if;
end process;
end Behavioral;